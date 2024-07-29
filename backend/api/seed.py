from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from core.db import engine
from core.security import get_password_hash
from db.permissions import create_permissions
from db.roles import create_basic_roles, get_role
from db.users import get_user_by_email
from db.zoo import get_main_zoo, get_zoo_by_name
from models import User, Zoo


async def seed_db() -> None:
    async with AsyncSession(engine) as session:
        admin_exists = await get_role("admin", session)
        if admin_exists:
            return

    await create_admin()
    await create_zoo()

    await create_permissions()
    await create_basic_roles()


async def create_admin() -> None:
    async with AsyncSession(engine) as session:
        # check if admin user already exists
        admin_user = await get_user_by_email(settings.ADMIN_EMAIL, session)
        print("admin_user", admin_user)
        if admin_user:
            return

        user = User(
            email=settings.ADMIN_EMAIL,
            first_name="Admin",
            last_name="Admin",
            username=settings.ADMIN_USERNAME,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            role=await get_role("admin", session),
            zoo=await get_main_zoo(session),
        )  # type: ignore

        session.add(user)
        await session.commit()


async def create_zoo() -> None:
    async with AsyncSession(engine) as session:
        zoo_exists = await get_zoo_by_name(settings.ZOO_NAME, session)

        if zoo_exists:
            return

        zoo = Zoo(
            name=settings.ZOO_NAME,
            location=settings.ZOO_LOCATION,
        )  # type: ignore

        session.add(zoo)
        await session.commit()
