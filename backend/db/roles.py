from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.db import engine
from db.permissions import PermissionType, get_permissions, permission_names
from models import Role


async def get_role(name: str, session) -> Role | None:
    role = (await session.exec(select(Role).where(Role.name == name))).first()
    return role


async def create_role(session, name: str, permission_names: list[PermissionType]):
    permissions = await get_permissions(session, permission_names)
    if len(permission_names) != len(permissions):
        raise ValueError("Some permissions do not exist")

    role = Role(name=name, permissions=permissions)
    session.add(role)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()


async def create_basic_roles():
    async with AsyncSession(engine) as session:
        admin_exists = await get_role("admin", session)
        if admin_exists:
            return

        await create_role(session, "admin", permission_names=list(permission_names))
        await create_role(
            session,
            "moderator",
            [
                "view_animals",
                "view_events",
                "create_events",
                "update_events",
                "delete_events",
                "update_animals",
                "delete_animals",
            ],
        )
        await create_role(
            session,
            "handler",
            [
                "view_animals",
                "checkout_animals",
                "checkin_animals",
                "view_events",
                "add_animal_health_log",
            ],
        )
        await create_role(session, "visitor", ["view_animals", "view_events"])
