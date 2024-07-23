from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from sqlmodel import and_, col, select

from api.deps import CurrentUser, SessionDep
from db.animals import get_animals_status, update_animals_status
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
    Role,
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
    animals = list(animals.all())
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
    clashing_animals = list(clashing_animals.all())
    if clashing_animals:
        raise HTTPException(
            status_code=400,
            detail="Some animals are already assigned to an event during this time",
        )

    # validate checkouts if checkout_immediately
    if body.checkout_immediately:
        for animal in animals:
            if animal.handling_enabled and current_user.role.name != "handler":
                raise HTTPException(
                    status_code=400,
                    detail="You are not a handler and cannot checkout animals",
                )

            if animal.tier > current_user.tier:
                raise HTTPException(
                    status_code=401,
                    detail="You do not have enough tier to checkout this animal",
                )

        animals_status = await get_animals_status(session, animal_ids=body.animal_ids)
        if not all([animal.status == "available" for animal in animals_status]):
            raise HTTPException(
                status_code=400, detail="Some animals are not available to checkout"
            )

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

    now = datetime.now(UTC)
    for id in body.animal_ids:
        animal_link = AnimalEvent(
            animal_id=id,
            event_id=event.id,
            checked_out=now if body.checkout_immediately else None,
            user_out_id=current_user_id if body.checkout_immediately else None,
        )  # type: ignore
        session.add(animal_link)

    await session.commit()

    # update animals status
    await update_animals_status(body.animal_ids, "checked_out", session)
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


@router.put("/{event_id}/animals")
async def reassign_animals_to_event(
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
        animal_id
        for animal_id in body.animal_ids
        if animal_id not in [animal.id for animal in assigned_animals]
    ]

    for animal_id in to_add_animal_ids:
        animal_link = AnimalEvent(animal_id=animal_id, event_id=event_id)  # type: ignore
        session.add(animal_link)

    await session.commit()
    await session.refresh(event)

    return {"message": "Changes saved"}


class AssignHandlersIn(BaseModel):
    handler_ids: list[int]


@router.put("/{event_id}/handlers")
async def reassign_handlers_to_event(
    event_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    body: AssignHandlersIn,
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    handler_role = await session.exec(select(Role).where(Role.name == "handler"))
    handler_role = handler_role.first()

    if not handler_role:
        raise HTTPException(status_code=404, detail="Handler role not found")

    handlers = await session.exec(
        select(User).where(
            col(User.id).in_(body.handler_ids), User.role_id == handler_role.id
        )
    )
    handlers = list(handlers.all())

    if not (len(handlers) == len(body.handler_ids)):
        raise HTTPException(status_code=404, detail="Handler not found")

    current_handlers = await session.exec(
        select(User).join(UserEvent).where(UserEvent.event_id == event_id)
    )
    current_handlers = list(current_handlers.all())

    # to remove handlers
    to_remove_handler_ids = [
        handler.id for handler in current_handlers if handler.id not in body.handler_ids
    ]

    for handler_id in to_remove_handler_ids:
        link = await session.exec(
            select(UserEvent).where(
                UserEvent.user_id == handler_id, UserEvent.event_id == event_id
            )
        )
        link = link.first()
        await session.delete(link)
        await session.commit()

    # to add handlers
    to_add_handler_ids = [
        handler_id
        for handler_id in body.handler_ids
        if handler_id not in [handler.id for handler in current_handlers]
    ]

    for handler_id in to_add_handler_ids:
        user_link = UserEvent(
            user_id=handler_id,
            event_id=event_id,
            assigner_id=current_user.id,  # type: ignore
        )  # type: ignore
        session.add(user_link)

    await session.commit()
    await session.refresh(event)

    return {"message": "Changes saved"}


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


class AnimalCheckInOut(BaseModel):
    animal_ids: list[int]


@router.put("/{event_id}/checkin")
async def checkin_animal(
    event_id: int,
    body: AnimalCheckInOut,
    session: SessionDep,
    current_user: CurrentUser,
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    # validate event
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # validate that animals are assigned to this event
    animals_link: list[AnimalEvent] = await session.exec(
        select(AnimalEvent)
        .where(
            col(AnimalEvent.event_id) == event_id,
            col(AnimalEvent.animal_id).in_(body.animal_ids),
        )
        .options(joinedload(AnimalEvent.animal))  # type: ignore
    )
    animals_link = list(animals_link.all())  # type: ignore

    if not len(animals_link) == len(body.animal_ids):
        raise HTTPException(
            status_code=404, detail="Some animals are not assigned to this event"
        )

    for animal_link in animals_link:
        # if already checked in
        if animal_link.checked_in:
            raise HTTPException(
                status_code=400,
                detail=f"Animal {animal_link.animal.name} is already checked in",
            )

        # if not checked out yet
        if not animal_link.checked_out:
            raise HTTPException(
                status_code=400,
                detail=f"Animal {animal_link.animal.name} is not checked out for this event",
            )

        # if animal is not handling enabled
        if animal_link.animal.handling_enabled and current_user.role.name != "handler":
            raise HTTPException(
                status_code=400,
                detail="You are not authorized to perform this action",
            )

        # check animals and user tier
        if animal_link.animal.tier > current_user.tier:
            raise HTTPException(
                status_code=401,
                detail="You do not have enough tier to check in this animal",
            )

    # finally checkin animals
    for animal_link in animals_link:
        now = datetime.now(UTC)
        animal_link.checked_in = now
        animal_link.user_in_id = current_user.id
        animal_link.duration = now - animal_link.checked_out  # type: ignore
        session.add(animal_link)

    await session.commit()
    await session.refresh(event)

    return {"message": "Animals checked in"}


@router.put("/{event_id}/checkout")
async def checkout_animal(
    event_id: int,
    body: AnimalCheckInOut,
    session: SessionDep,
    current_user: CurrentUser,
):
    if not has_permission(current_user.role.permissions, "manage_events"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    # validate event
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # validate animals avaialability
    animals_status = await get_animals_status(session, animal_ids=body.animal_ids)
    for animal_status in animals_status:
        if animal_status.status != "available":
            raise HTTPException(
                status_code=400,
                detail=f"{animal_status.animal.name} is not available to checkout",
            )

    # validate that animals are assigned to this event
    animals_link: list[AnimalEvent] = await session.exec(
        select(AnimalEvent)
        .where(
            col(AnimalEvent.event_id) == event_id,
            col(AnimalEvent.animal_id).in_(body.animal_ids),
        )
        .options(joinedload(AnimalEvent.animal))  # type: ignore
    )
    animals_link = list(animals_link.all())  # type: ignore

    if not len(animals_link) == len(body.animal_ids):
        raise HTTPException(
            status_code=404, detail="Some animals are not assigned to this event"
        )

    for animal_link in animals_link:
        # if already checked out
        if animal_link.checked_out:
            raise HTTPException(
                status_code=400,
                detail=f"Animal {animal_link.animal.name} is already checked out",
            )

        # if handling enabled and not handler
        if animal_link.animal.handling_enabled and current_user.role.name != "handler":
            raise HTTPException(
                status_code=400,
                detail="You are not authorized to perform this action",
            )

        # check animals and user tier
        if animal_link.animal.tier > current_user.tier:
            raise HTTPException(
                status_code=401,
                detail="You do not have enough tier to checkout this animal",
            )

    # finally checkout animals
    for animal_link in animals_link:
        animal_link.checked_out = datetime.now(UTC)
        animal_link.user_out_id = current_user.id
        session.add(animal_link)

    await session.commit()
    await session.refresh(event)

    return {"message": "Animals checked out"}
