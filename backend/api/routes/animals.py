from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from sqlmodel import and_, col, desc, select

from api.deps import CurrentUser, SessionDep
from db.animals import get_all_animals, get_animal_by_id, log_audit, log_fields_update
from db.utils import has_permission
from models import (
    Animal,
    AnimalAudit,
    AnimalAuditWithDetails,
    AnimalEvent,
    AnimalEventWithDetails,
    AnimalIn,
    AnimalWithEvents,
    Event,
    EventComment,
    EventCommentWithUser,
    EventWithDetailsAndComments,
    UserEvent,
    UserEventWithDetails,
    Zoo,
)

router = APIRouter(prefix="/animals", tags=["Animals"])


@router.get("/")
async def read_all_animals(
    session: SessionDep, zoo_id: int | None = None
) -> list[Animal]:
    return await get_all_animals(zoo_id, session)


@router.get("/status")
async def get_animal_status(session: SessionDep, zoo_id: int | None = None):
    # get daily event checkout
    query = (
        select(
            Animal,
            func.count(col(AnimalEvent.id)).label("daily_event_count"),
            func.sum(col(AnimalEvent.duration)).label("daily_event_duration"),
        )
        .outerjoin(
            AnimalEvent,
            (
                and_(
                    col(Animal.id) == col(AnimalEvent.animal_id),
                    func.DATE(col(AnimalEvent.checked_in)) == date.today(),
                )
            ),
        )
        .where(Animal.zoo_id == zoo_id if zoo_id else True)
        .group_by(col(Animal.id))
    )
    animals = (await session.exec(query)).all()

    animal_status = []

    for animal, daily_event_count, daily_event_duration in animals:
        status: str = ""
        status_description: str = ""

        if animal.status == "checked_in":
            if daily_event_count >= animal.max_daily_checkouts:
                status = "unavailable"
                status_description = "Daily Check-out limit reached"
            elif daily_event_duration and daily_event_duration >= timedelta(
                hours=animal.max_daily_checkout_hours
            ):
                status = "unavailable"
                status_description = "Allowed Check-out duration reached"
            else:
                if animal.last_checkin_time and animal.last_checkin_time + timedelta(
                    hours=animal.rest_time
                ) > datetime.now(UTC):
                    hours_left = (
                        animal.last_checkin_time + timedelta(hours=animal.rest_time)
                    ) - datetime.now(UTC)

                    status = "unavailable"
                    status_description = (
                        f"Resting for {hours_left / timedelta(hours=1)} hours"
                    )
                else:
                    status = "available"
                    status_description = "Animal is available for check-out"
        elif animal.status == "checked_out":
            status = "checked_out"
            status_description = "Animal is already checked out"
        elif animal.status == "unavailable":
            status = "unavailable"
            status_description = "By Admin"
        else:
            raise Exception("Invalid animal status")

        animal_status.append(
            {
                "animal": animal,
                "status": status,
                "status_description": status_description,
            }
        )

    return animal_status


@router.get("/{animal_id}")
async def get_animal(animal_id: int, session: SessionDep) -> Animal:
    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return animal


@router.get("/{animal_id}/details")
async def get_animal_details(animal_id: int, session: SessionDep) -> AnimalWithEvents:
    query = (
        select(
            Animal,
            func.count(col(AnimalEvent.id)).label("daily_event_count"),
            func.sum(col(AnimalEvent.duration)).label("daily_event_duration"),
        )
        .outerjoin(
            AnimalEvent,
            (
                and_(
                    col(Animal.id) == col(AnimalEvent.animal_id),
                    func.DATE(col(AnimalEvent.checked_in)) == date.today(),
                )
            ),
        )
        .where(Animal.id == animal_id)
        .group_by(col(Animal.id))
    )
    animal = (await session.exec(query)).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    animal, daily_event_count, daily_event_duration = animal

    zoo = await session.exec(select(Zoo).where(Zoo.id == animal.zoo_id))
    zoo = zoo.first()

    # convert to hours
    daily_event_duration = (
        daily_event_duration / timedelta(hours=1) if daily_event_duration else 0
    )

    # events
    events = await session.exec(
        select(Event).join(AnimalEvent).where(AnimalEvent.animal_id == animal_id)
    )
    events = events.all()

    event_ids = [event.id for event in events]
    print("event_ids", event_ids)
    event_animal_details = await session.exec(
        select(AnimalEvent)
        .where(col(AnimalEvent.event_id).in_(event_ids))
        .options(
            joinedload(AnimalEvent.animal),  # type: ignore
        )
    )
    event_animal_details = list(event_animal_details.unique())

    event_user_details = await session.exec(
        select(UserEvent)
        .where(col(UserEvent.event_id).in_(event_ids))
        .options(
            joinedload(UserEvent.user),  # type: ignore
        )
    )
    event_user_details = list(event_user_details.unique())

    events_comments = await session.exec(
        select(EventComment)
        .where(col(EventComment.event_id).in_(event_ids))
        .options(
            joinedload(EventComment.user)  # type: ignore
        )
    )
    events_comments = list(events_comments.unique())

    events_with_details: list[EventWithDetailsAndComments] = []
    for event in events:
        event_details = EventWithDetailsAndComments(
            event=event,
            animals=[
                AnimalEventWithDetails(
                    animal_event=animal_event, animal=animal_event.animal
                )
                for animal_event in event_animal_details
                if animal_event.event_id == event.id
            ],
            users=[
                UserEventWithDetails(user_event=user_event, user=user_event.user)
                for user_event in event_user_details
                if user_event.event_id == event.id
            ],
            comments=[
                EventCommentWithUser(user=event_comment.user, comment=event_comment)
                for event_comment in events_comments
                if event_comment.event_id == event.id
            ],
            event_type=event.event_type,
            zoo=event.zoo,
        )
        events_with_details.append(event_details)

    # separate events based on current, past, upcoming
    current_time = datetime.now(UTC)
    current_events = []
    past_events = []
    upcoming_events = []

    for event in events_with_details:
        if event.event.start_at <= current_time <= event.event.end_at:
            current_events.append(event)
        elif event.event.end_at < current_time:
            past_events.append(event)
        elif event.event.start_at > current_time:
            upcoming_events.append(event)

    return AnimalWithEvents(
        animal=animal,
        current_events=current_events,
        past_events=past_events,
        upcoming_events=upcoming_events,
        zoo=zoo,  # type: ignore
        daily_checkout_count=daily_event_count,
        daily_checkout_duration=daily_event_duration,
    )


@router.post("/")
async def create_animal(body: AnimalIn, session: SessionDep, current_user: CurrentUser):
    if not has_permission(current_user.role.permissions, "manage_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = Animal(**body.model_dump())
    session.add(animal)
    await session.commit()
    await session.refresh(animal)
    await session.refresh(current_user)

    # log audit
    await log_audit(
        session,
        animal_id=animal.id,
        changed_by=current_user.id,
        action="animal_created",
        description=f"{current_user.first_name} {current_user.last_name} ({current_user.role.name}) created an animal with name {animal.name}",
    )

    return JSONResponse({"message": "Animal created"}, status_code=200)


@router.delete("/{animal_id}")
async def delete_animal(animal_id: int, session: SessionDep, current_user: CurrentUser):
    if not has_permission(current_user.role.permissions, "manage_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    # log audit
    await log_audit(
        session,
        animal_id=animal.id,
        changed_by=current_user.id,
        action="animal_deleted",
        description=f"{current_user.first_name} {current_user.last_name} ({current_user.role.name}) deleted an animal with name {animal.name}",
        commit=False,
    )

    await session.delete(animal)
    await session.commit()
    return {"message": "Animal deleted"}


@router.put("/{animal_id}")
async def update_animal(
    animal_id: int,
    animal_update: AnimalIn,
    session: SessionDep,
    current_user: CurrentUser,
):
    if not has_permission(current_user.role.permissions, "manage_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    for field, value in animal_update.model_dump().items():
        setattr(animal, field, value)

    # log audits for each field thats updated
    await log_fields_update(session, animal, animal_update, current_user)

    await session.commit()
    await session.refresh(animal)
    return JSONResponse(content={"message": "Animal updated"}, status_code=200)


@router.put("/{animal_id}/unavailable")
async def mark_animal_unavailable(
    animal_id: int, session: SessionDep, current_user: CurrentUser
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    animal.status = "unavailable"
    await session.commit()
    return JSONResponse(
        content={"message": "Animal marked unavailable"}, status_code=200
    )


@router.put("/{animal_id}/available")
async def mark_animal_available(
    animal_id: int, session: SessionDep, current_user: CurrentUser
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    animal.status = "checked_in"
    await session.commit()
    return JSONResponse(content={"message": "Animal marked available"}, status_code=200)


@router.get("/{animal_id}/audits")
async def get_animal_audits(
    animal_id: int, session: SessionDep
) -> list[AnimalAuditWithDetails]:
    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    audits = await session.exec(
        select(AnimalAudit)
        .where(col(AnimalAudit.animal_id) == animal_id)
        .order_by(desc(AnimalAudit.changed_at))
    )
    audits = audits.all()

    return [
        AnimalAuditWithDetails(audit=audit, animal=audit.animal, user=audit.user)
        for audit in audits
    ]
