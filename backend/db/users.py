from fastapi import HTTPException
from sqlmodel import col, select

from models import User, UserEvent


async def get_user_by_email(email: str, session) -> User | None:
    user = (await session.exec(select(User).where(User.email == email))).first()
    return user


async def get_user_by_id(id: int, session) -> User | None:
    user = (await session.exec(select(User).where(User.id == id))).first()
    return user


async def get_user_by_username(username: str, session) -> User | None:
    user = (await session.exec(select(User).where(User.username == username))).first()
    return user


async def validate_users(user_ids: list[int], session) -> list[User]:
    users = (
        await session.exec(select(User).where(col(User.id).in_(user_ids)))
    ).unique()
    users = list(users)
    if len(users) != len(user_ids):
        raise HTTPException(status_code=404, detail="User not found")
    return users


async def validate_check_in_out_permissions(current_user: User, event_id: int, session):
    if current_user.role.name not in ["handler", "admin"]:
        raise HTTPException(
            status_code=401, detail="You are not authorized to perform this action"
        )

    # if user is a handler check if he is assigned to event
    if current_user.role.name == "handler":
        user_event = await session.exec(
            select(UserEvent).where(
                UserEvent.user_id == current_user.id, UserEvent.event_id == event_id
            )
        )
        if not user_event.first():
            raise HTTPException(
                status_code=400,
                detail="You are not assigned as a handler to this event",
            )

    return True
