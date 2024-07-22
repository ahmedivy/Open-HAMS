from datetime import UTC, datetime

from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import delete, func
from sqlalchemy.orm import joinedload
from sqlmodel import and_, col, select

from api.deps import CurrentUser, SessionDep
from db.animals import log_activity, log_audit
from db.utils import has_permission
from models import (
    Animal,
    AnimalEvent,
    Event,
    EventComment,
    EventCommentIn,
    EventCreate,
    EventType,
    EventWithDetails,
    User,
    UserEvent,
)

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/")
async def read_all_events(session: SessionDep):
    query = (
        select(
            Event,
            EventType,
            func.count(col(AnimalEvent.animal_id)).label("animal_count"),
        )
        .join(AnimalEvent, isouter=True)
        .join(EventType)
        .group_by(col(Event.id), col(EventType.id))
    )
    events = (await session.exec(query)).all()
    return [
        {"event": event, "animal_count": animal_count, "event_type": event_type}
        for event, event_type, animal_count in events
    ]


@router.post("/")
async def create_event(
    body: EventCreate, session: SessionDep, current_user: CurrentUser
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    # validate event type
    event_type = await session.exec(
        select(EventType.id).where(
            and_(
                EventType.id == body.event.event_type_id,
                EventType.zoo_id == body.event.zoo_id,
            )
        )
    )
    if not event_type.first():
        raise HTTPException(status_code=404, detail="Event type not found for this zoo")

    # validate users
    users = await session.exec(select(User).where(col(User.id).in_(body.user_ids)))
    users = list(users.unique())
    if len(users) != len(body.user_ids):
        raise HTTPException(status_code=404, detail="User not found")

    print(users)

    # validate animals
    animals = await session.exec(
        select(Animal).where(
            and_(
                col(Animal.id).in_(body.animal_ids), Animal.zoo_id == body.event.zoo_id
            )
        )
    )
    animals = animals.all()
    if len(animals) != len(body.animal_ids):
        raise HTTPException(status_code=404, detail="Animal not found")

    # check if animals are already assigned to an event during this time
    clashing_animals = await session.exec(
        select(Animal.name)
        .join(AnimalEvent)
        .join(Event)
        .where(
            and_(
                Event.start_at <= body.event.end_at,
                Event.end_at >= body.event.start_at,
                Event.zoo_id == body.event.zoo_id,
                col(Animal.id).in_(body.animal_ids),
            )
        )
        .group_by(Animal.name)
    )
    if clashing_animals.all():
        raise HTTPException(
            status_code=400,
            detail="Some animals are already assigned to an event during this time",
        )

    # if body.checkout_immediately:
    #     ...

    event = Event(**body.event.model_dump())
    session.add(event)

    current_user_id = current_user.id

    await session.commit()
    await session.refresh(event)

    for id in body.user_ids:
        user_link = UserEvent(
            user_id=id, event_id=event.id, assigner_id=current_user_id
        )  # type: ignore
        session.add(user_link)

    for id in body.animal_ids:
        animal_link = AnimalEvent(animal_id=id, event_id=event.id)  # type: ignore
        session.add(animal_link)

    await session.commit()
    await session.refresh(event)

    return event


@router.put("/{event_id}")
async def update_event(
    body: EventCreate, session: SessionDep, current_user: CurrentUser, event_id: int
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # validate event type
    event_type = await session.exec(
        select(EventType.id).where(
            and_(
                EventType.id == body.event.event_type_id,
                EventType.zoo_id == body.event.zoo_id,
            )
        )
    )
    if not event_type.first():
        raise HTTPException(status_code=404, detail="Event type not found for this zoo")

    # validate users
    users = await session.exec(select(User).where(col(User.id).in_(body.user_ids)))
    users = list(users.unique())
    if len(users) != len(body.user_ids):
        raise HTTPException(status_code=404, detail="User not found")

    # validate animals
    animals = await session.exec(
        select(Animal).where(
            and_(
                col(Animal.id).in_(body.animal_ids), Animal.zoo_id == body.event.zoo_id
            )
        )
    )
    animals = animals.all()
    if len(animals) != len(body.animal_ids):
        raise HTTPException(status_code=404, detail="Animal not found")

    # check if animals are already assigned to an event during this time
    clashing_animals = await session.exec(
        select(Animal.name)
        .join(AnimalEvent)
        .join(Event)
        .where(
            and_(
                Event.start_at <= body.event.end_at,
                Event.end_at >= body.event.start_at,
                Event.zoo_id == body.event.zoo_id,
                col(Animal.id).in_(body.animal_ids),
                Event.id != event_id,
            )
        )
        .group_by(Animal.name)
    )
    if clashing_animals.all():
        raise HTTPException(
            status_code=400,
            detail="Some animals are already assigned to an event during this time",
        )

    for k, v in body.event.model_dump().items():
        setattr(event, k, v)

    # existing_users
    existing_users = await session.exec(
        select(UserEvent).where(UserEvent.event_id == event_id)
    )
    existing_users = existing_users.all()

    # existing_animals
    existing_animals = await session.exec(
        select(AnimalEvent).where(AnimalEvent.event_id == event_id)
    )
    existing_animals = existing_animals.all()

    # to remove users
    to_remove_users = [
        user for user in existing_users if user.user_id not in body.user_ids
    ]
    for user in to_remove_users:
        await session.delete(user)

    # to remove animals
    to_remove_animals = [
        animal for animal in existing_animals if animal.animal_id not in body.animal_ids
    ]
    for animal in to_remove_animals:
        await session.delete(animal)

    # to add users
    to_add_users = [
        user
        for user in body.user_ids
        if user not in [user.user_id for user in existing_users]
    ]
    for user in to_add_users:
        user_link = UserEvent(
            user_id=user,
            event_id=event_id,
            assigner_id=current_user.id,  # type: ignore
        )
        session.add(user_link)

    # to add animals
    to_add_animals = [
        animal
        for animal in body.animal_ids
        if animal not in [animal.animal_id for animal in existing_animals]
    ]
    for animal in to_add_animals:
        animal_link = AnimalEvent(animal_id=animal, event_id=event_id)  # type: ignore
        session.add(animal_link)

    await session.commit()
    await session.refresh(event)

    return JSONResponse({"message": "Event updated"}, status_code=200)


@router.delete("/{event_id}")
async def delete_event(event_id: int, session: SessionDep, current_user: CurrentUser):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # delete all user links
    user_links = await session.exec(
        select(UserEvent).where(UserEvent.event_id == event_id)
    )
    for user_link in user_links:
        await session.delete(user_link)

    # delete all animal links
    animal_links = await session.exec(
        select(AnimalEvent).where(AnimalEvent.event_id == event_id)
    )
    for animal_link in animal_links:
        await session.delete(animal_link)

    await session.delete(event)
    await session.commit()

    return {"message": "Event deleted"}


@router.get("/{event_id}")
async def read_event(event_id: int, session: SessionDep) -> EventWithDetails:
    event = await session.exec(
        select(Event)
        .where(Event.id == event_id)
        .options(joinedload(Event.event_type), joinedload(Event.zoo))  # type: ignore
    )
    event = event.first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    handlers = await session.exec(
        select(User).join(UserEvent).where(UserEvent.event_id == event_id)
    )
    handlers = list(handlers.unique())

    animals = await session.exec(
        select(Animal).join(AnimalEvent).where(AnimalEvent.event_id == event_id)
    )
    animals = list(animals.unique())

    return EventWithDetails(
        event=event,
        event_type=event.event_type,
        zoo=event.zoo,
        users=handlers,  # type: ignore
        animals=animals,
    )


class AssignAnimalsIn(BaseModel):
    animal_ids: list[int]


@router.put("/{event_id}/assign-animals")
async def assign_animals_to_event(
    event_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    body: AssignAnimalsIn,
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    animals = await session.exec(
        select(Animal).where(col(Animal.id).in_(body.animal_ids))
    )
    animals = animals.all()

    if not (len(animals) == len(body.animal_ids)):
        raise HTTPException(status_code=404, detail="Animal not found")

    # check if animals are already assigned to an event during this time
    clashing_animals = await session.exec(
        select(Animal.name)
        .join(AnimalEvent)
        .join(Event)
        .where(
            and_(
                Event.start_at <= event.end_at,
                Event.end_at >= event.start_at,
                Event.zoo_id == event.zoo_id,
                col(Animal.id).in_(body.animal_ids),
                Event.id != event_id,
            )
        )
        .group_by(Animal.name)
    )
    clashing_animals = clashing_animals.all()
    if clashing_animals:
        raise HTTPException(
            status_code=400,
            detail=f'Some animals are already assigned to an event during this time: {", ".join([animal for animal in clashing_animals])}',
        )

    # already assigned animals
    assigned_animals = await session.exec(
        select(Animal).join(AnimalEvent).where(AnimalEvent.event_id == event_id)
    )
    assigned_animals = assigned_animals.all()

    # to remove animals
    to_remove_animal_ids = [
        animal.id for animal in assigned_animals if animal.id not in body.animal_ids
    ]
    
    for animal_id in to_remove_animal_ids:
        event_animal_link = await session.exec(
            select(AnimalEvent).where(
                AnimalEvent.animal_id == animal_id, AnimalEvent.event_id == event_id
            )
        )
        event_animal_link = event_animal_link.first()
        await session.delete(event_animal_link)

    # to add animals
    to_add_animal_ids = [
        animal_id for animal_id in body.animal_ids if animal_id not in [animal.id for animal in assigned_animals]
    ]

    for animal_id in to_add_animal_ids:
        animal_link = AnimalEvent(animal_id=animal_id, event_id=event_id) # type: ignore
        session.add(animal_link)

    await session.commit()
    await session.refresh(event)




    return {"message": "Animals assigned to event"}


@router.post("/{event_id}/remove-animals")
async def remove_animals_from_event(
    event_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    animal_ids: list[int] = Body(...),
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    animals = await session.exec(select(Animal).where(col(Animal.id).in_(animal_ids)))
    animals = animals.all()

    if not animals:
        raise HTTPException(status_code=404, detail="No animals found")

    for animal in animals:
        # remove the link between the animal and the event
        event_animal_link = await session.exec(
            select(AnimalEvent).where(
                AnimalEvent.animal_id == animal.id, AnimalEvent.event_id == event_id
            )
        )
        event_animal_link = event_animal_link.first()

        if not event_animal_link:
            continue

        await session.delete(event_animal_link)

        # log the activity
        log = f"Animal {animal.id} removed from event {event_id}"
        await log_activity(animal.id, log, session)

    session.add(event)
    await session.commit()
    await session.refresh(event)

    return event


@router.post("/{event_id}/animal/{animal_id}/check-in")
async def check_in_animal(
    event_id: int, animal_id: int, session: SessionDep, current_user: CurrentUser
):
    """
    Check in an animal to an event and update the animal's daily checkout count
    """

    if not has_permission(current_user.role.permissions, "checkout_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    animal = await session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    # check if users has enough tier to check in the animal
    if current_user.tier < animal.tier:
        raise HTTPException(
            status_code=401,
            detail="Users does not have enough tier to check in/out this animal",
        )

    event_animal_link = await session.exec(
        select(AnimalEvent).where(
            AnimalEvent.animal_id == animal_id, AnimalEvent.event_id == event_id
        )
    )
    event_animal_link = event_animal_link.first()

    if not animal.checked_in:
        raise HTTPException(
            status_code=400, detail="Animal is already checked in to some event"
        )

    if not event_animal_link:
        raise HTTPException(status_code=404, detail="Animal not assigned to this event")

    if event_animal_link.checked_in:
        raise HTTPException(
            status_code=400, detail="Animal is already checked in to event"
        )

    if animal.daily_checkout_count >= animal.max_daily_checkouts:
        raise HTTPException(
            status_code=400, detail="Animal has reached maximum checkouts for the day"
        )

    event_duration = event.end_at - event.start_at
    possible_animal_checkout_duration = animal.daily_checkout_duration + event_duration
    possible_animal_hours = possible_animal_checkout_duration.total_seconds() / 3600
    if possible_animal_hours > float(animal.max_daily_checkout_hours):
        raise HTTPException(
            status_code=400,
            detail="Animal has reached maximum checkout hours for the day",
        )

    animal.daily_checkout_count += 1
    animal.checked_in = False

    event_animal_link.checked_in = datetime.now(UTC)
    event_animal_link.user_in_id = current_user.id

    # log the activity
    log = f"Animal {animal_id} checked in to event {event_id}"
    await log_activity(animal_id, log, session)

    # log the audit
    await log_audit(
        animal.id, current_user.id, "status", "checked_in", "checked_out", session
    )

    session.add(event_animal_link)
    await session.commit()

    return {"message": "Animal checked in"}


@router.post("/{event_id}/animal/{animal_id}/check-out")
async def check_out_animal(
    event_id: int, animal_id: int, session: SessionDep, current_user: CurrentUser
):
    if not has_permission(current_user.role.permissions, "checkout_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    animal = await session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    # check if users has enough tier to check in the animal
    if current_user.tier < animal.tier:
        raise HTTPException(
            status_code=401,
            detail="Users does not have enough tier to check in/out this animal",
        )

    event_animal_link = await session.exec(
        select(AnimalEvent).where(
            AnimalEvent.animal_id == animal_id, AnimalEvent.event_id == event_id
        )
    )
    event_animal_link = event_animal_link.first()

    if animal.checked_in:
        raise HTTPException(
            status_code=400, detail="Animal is not checked in to any event"
        )

    if not event_animal_link:
        raise HTTPException(status_code=404, detail="Animal not assigned to this event")

    if not event_animal_link.checked_in:
        raise HTTPException(status_code=400, detail="Animal is not checked in")

    if event_animal_link.checked_out:
        raise HTTPException(status_code=400, detail="Animal is already checked out")

    event_animal_link.checked_out = datetime.now(UTC)
    event_animal_link.user_out_id = current_user.id
    event_animal_link.duration = (
        event_animal_link.checked_out - event_animal_link.checked_in
    )

    animal.checked_in = True
    animal.daily_checkout_duration += event_animal_link.duration

    # log the activity
    log = f"Animal {animal_id} checked out from event {event_id}"
    await log_activity(animal_id, log, session)

    # log the audit
    await log_audit(
        animal.id, current_user.id, "status", "checked_out", "checked_in", session
    )

    session.add(event_animal_link)
    session.add(animal)
    await session.commit()

    return {"message": "Animal checked out"}


@router.post("/{event_id}/comments")
async def add_comment_to_event(
    event_id: int,
    body: EventCommentIn,
    session: SessionDep,
    current_user: CurrentUser,
):
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    comment = EventComment(
        event_id=event_id,
        user_id=current_user.id,
        comment=body.comment,
    )  # type: ignore

    session.add(comment)
    await session.commit()

    return JSONResponse({"message": "Comment added"}, status_code=200)
