from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from api.deps import CurrentUser, SessionDep
from models import EventType, EventTypeIn

router = APIRouter(prefix="/event-type", tags=["Event Types"])


@router.get("/")
async def read_all_events_types(session: SessionDep) -> list[EventType]:
    event_types = await session.exec(select(EventType))
    return list(event_types.all())


@router.post("/")
async def create_event_type(
    event: EventTypeIn,
    session: SessionDep,
    current_user: CurrentUser,
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="You don't have permission to create an event type"
        )

    event = EventType(**event.model_dump())
    session.add(event)

    try:
        await session.commit()
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="An event type with this name already exists",
        )

    return JSONResponse({"message": "Event type created"}, status_code=200)


@router.put("/{event_type_id}")
async def update_event_type(
    event_type_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    event_updated: EventTypeIn = Body(...),
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="You don't have permission to manage an event type"
        )

    event = await session.get(EventType, event_type_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event type not found")

    for key, value in event_updated.model_dump().items():
        setattr(event, key, value)

    try:
        await session.commit()
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="An event type with this name already exists",
        )

    return JSONResponse({"message": "Event type updated"}, status_code=200)


@router.put("/{event_id}/group/{group_id}")
async def update_group(
    event_id: int,
    group_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="You don't have permission to update an event type"
        )

    event = await session.get(EventType, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event type not found")

    event.group_id = group_id
    await session.commit()

    return JSONResponse({"message": "Event type updated"}, status_code=200)


@router.put("/{event_id}/zoo/{zoo_id}")
async def update_zoo(
    event_id: int,
    zoo_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="You don't have permission to update an event type"
        )

    event = await session.get(EventType, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event type not found")

    event.zoo_id = zoo_id
    await session.commit()

    return JSONResponse({"message": "Event type updated"}, status_code=200)
