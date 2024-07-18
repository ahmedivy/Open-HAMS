from datetime import UTC, date, datetime, timedelta
from time import timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import func
from sqlmodel import and_, col, select

from api.deps import CurrentUser, SessionDep
from db.animals import get_all_animals, get_animal_by_id
from db.utils import has_permission
from models import Animal, AnimalEvent, AnimalIn

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


@router.post("/")
async def create_animal(
    animal: Animal, session: SessionDep, current_user: CurrentUser
) -> Animal:
    print(current_user.role.permissions)

    if not has_permission(current_user.role.permissions, "manage_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    session.add(animal)
    await session.commit()
    await session.refresh(animal)
    return animal


@router.delete("/{animal_id}")
async def delete_animal(animal_id: int, session: SessionDep, current_user: CurrentUser):
    if not has_permission(current_user.role.permissions, "manage_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    await session.delete(animal)
    return {"message": "Animal deleted"}


@router.put("/{animal_id}")
async def update_animal(
    animal_id: int,
    animal_update: AnimalIn,
    session: SessionDep,
    current_user: CurrentUser,
) -> Animal:
    if not has_permission(current_user.role.permissions, "manage_animals"):
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    animal = await get_animal_by_id(animal_id, session)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    for field, value in animal_update.model_dump().items():
        setattr(animal, field, value)

    await session.commit()
    await session.refresh(animal)
    return animal
