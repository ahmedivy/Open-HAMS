from datetime import UTC, date, datetime, timedelta
from typing import Literal

from sqlalchemy import func
from sqlmodel import and_, col, desc, select

from models import (
    Animal,
    AnimalActitvityLog,
    AnimalAudit,
    AnimalEvent,
    AnimalIn,
    AnimalStatus,
    User,
)


async def get_all_animals(zoo_id: int | None, session) -> list[Animal]:
    if zoo_id:
        animals = await session.exec(
            select(Animal)
            .where(Animal.zoo_id == zoo_id)
            .order_by(desc(Animal.updated_at))
        )
    else:
        animals = await session.exec(select(Animal))

    return animals.all()


async def get_animal_by_id(id: int, session) -> Animal | None:
    animal = (await session.exec(select(Animal).where(Animal.id == id))).first()
    return animal


async def get_animals_status(
    session, animal_ids: list[int] | None = None, zoo_id: int | None = None
):
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
        .where(
            Animal.zoo_id == zoo_id if zoo_id else True,
            col(Animal.id).in_(animal_ids) if animal_ids is not None else True,
        )
        .group_by(col(Animal.id))
    )
    animals = list((await session.exec(query)).all())

    animal_status: list[AnimalStatus] = []

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
            AnimalStatus(
                animal=animal, status=status, status_description=status_description
            )
        )

    return animal_status


async def update_animals_status(
    animal_ids: list[int],
    status: Literal["checked_in", "checked_out", "unavailable"],
    session,
):
    animals: list[Animal] = await session.exec(
        select(Animal).where(col(Animal.id).in_(animal_ids))
    )
    animals = list(animals.all())  # type: ignore

    for animal in animals:
        animal.status = status
        session.add(animal)
    await session.commit()


async def log_activity(animal_id: int, details: str, session):
    log = AnimalActitvityLog(animal_id=animal_id, details=details)  # type: ignore
    session.add(log)
    await session.commit()
    return log


AuditActions = Literal[
    "animal_created",
    "animal_updated",
    "animal_deleted",
    "checked_in",
    "checked_out",
    "comment_added",
    "comment_updated",
    "health_log_added",
    "health_log_updated",
    "activity_logged",
    "group_added",
    "group_removed",
    "tier_changed",
    "max_daily_checkouts_changed",
    "max_checkout_hours_changed",
    "rest_time_changed",
    "image_updated",
    "role_assigned",
    "role_updated",
    "event_participation_added",
    "event_participation_removed",
    "zoo_changed",
]


async def log_audit(
    session,
    animal_id: int,
    changed_by: int,
    action: AuditActions,
    changed_field: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
    description: str | None = None,
    commit: bool = True,
):
    audit = AnimalAudit(
        animal_id=animal_id,
        changed_by=changed_by,
        action=action,
        changed_field=changed_field,
        old_value=old_value,
        new_value=new_value,
        description=description,
    )  # type: ignore
    session.add(audit)
    if commit:
        await session.commit()
    return audit


async def log_fields_update(
    session,
    animal: Animal,
    animal_new: AnimalIn,
    current_user: User,
):
    for field, value in animal_new.model_dump().items():
        if value != getattr(animal, field):
            # log audit
            await log_audit(
                session,
                animal_id=animal.id,
                changed_by=current_user.id,
                action=get_action(field),
                changed_field=field,
                old_value=getattr(animal, field),
                new_value=value,
                description=f"{current_user.first_name} {current_user.last_name} ({current_user.role.name}) updated an animal with name {animal.name}",
                commit=False,
            )

    await session.commit()


def get_action(field: str) -> AuditActions:
    match field:
        case "max_daily_checkouts":
            return "max_daily_checkouts_changed"
        case "max_daily_checkout_hours":
            return "max_checkout_hours_changed"
        case "rest_time":
            return "rest_time_changed"
        case "image":
            return "image_updated"
        case "tier":
            return "tier_changed"
        case "zoo_id":
            return "zoo_changed"

        case _:
            return "animal_updated"
