from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import func
from sqlmodel import and_, col, desc, or_, select

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
async def get_animal_status(session: SessionDep):
    # get daily event checkout
    query = (
        select(
            Animal,
            func.count(col(AnimalEvent.id)).label("event_count"),
        )
        .join(AnimalEvent, isouter=True)
        .where(
            or_(
                col(AnimalEvent.checked_in).is_(None),
                func.date(AnimalEvent.checked_in) == date.today(),
            )
        )
        .group_by(col(Animal.id))
    )
    animals = (await session.exec(query)).all()

    ...

    return [
        {"animal": animal, "event_count": event_count}
        for animal, event_count in animals
    ]


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
