from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import select
from starlette.exceptions import HTTPException

from api.deps import CurrentUser, SessionDep
from core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from db.events import get_events_details
from db.permissions import has_permission
from db.roles import get_role
from db.users import get_user_by_email, get_user_by_id, get_user_by_username
from db.zoo import get_main_zoo
from models import Event, User, UserEvent, UserWithDetails, UserWithEvents
from schemas import RoleIn, TierIn, Token, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
) -> Token:
    user = await get_user_by_username(form_data.username, session)
    if not user:
        user = await get_user_by_email(form_data.username, session)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=24 * 60 * 30)  # 30 days
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/", response_model=list[UserWithDetails])
async def get_users(session: SessionDep):
    users = (await session.exec(select(User).order_by(User.created_at))).unique()  # type: ignore
    return users


@router.get("/handlers")
async def get_handlers(session: SessionDep) -> list[UserWithDetails]:
    handlers = (await session.exec(select(User).where(User.role_id == 2))).unique()
    return list(handlers)  # type: ignore


@router.post("/")
async def create_user(session: SessionDep, user: UserCreate):
    # check if username or email already exists
    user_exists = await get_user_by_username(user.username, session)
    if user_exists:
        raise HTTPException(status_code=400, detail="Username already exists")

    user_exists = await get_user_by_email(user.email, session)
    if user_exists:
        raise HTTPException(status_code=400, detail="Try another email address")

    # get basic role
    role = await get_role("visitor", session)
    zoo = await get_main_zoo(session)

    hashed_password = get_password_hash(user.password)
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=role,
        zoo=zoo,
    )  # type: ignore
    session.add(new_user)
    await session.commit()
    return JSONResponse({"message": "User created"}, status_code=201)


@router.put("/me")
async def update_user(
    session: SessionDep,
    current_user: CurrentUser,
    user: UserUpdate = Body(),
):
    current_user.first_name = user.first_name
    current_user.last_name = user.last_name
    await session.commit()
    return JSONResponse({"message": "Information updated"}, status_code=200)


@router.get("/me")
async def get_authenticated_user(current_user: CurrentUser) -> UserWithDetails:
    return current_user  # type: ignore


@router.get("/me/permissions")
async def get_authenticated_user_permissions(current_user: CurrentUser):
    return current_user.role.permissions  # type: ignore


@router.get("/{user_id}")
async def get_user(user_id: int, session: SessionDep, _: CurrentUser) -> UserWithEvents:
    user = await get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    events = await session.exec(
        select(Event).join(UserEvent).where(UserEvent.user_id == user_id)
    )
    events = list(events.all())

    events_details = await get_events_details(session=session, events=events)

    current, past, upcoming = [], [], []

    current_time = datetime.now(UTC)

    for event in events_details:
        if event.event.start_at <= current_time <= event.event.end_at:
            current.append(event)
        elif event.event.end_at < current_time:
            past.append(event)
        elif event.event.start_at > current_time:
            upcoming.append(event)

    return UserWithEvents(
        user=user,  # type: ignore
        current_events=current,
        past_events=past,
        upcoming_events=upcoming,
    )


@router.delete("/{user_id}")
async def delete_user(user_id: int, session: SessionDep, current_user: CurrentUser):
    if (
        not has_permission(current_user.role.permissions, "delete_users")
        or current_user.id != user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized to delete this user",
        )

    user = await get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await session.delete(user)
    await session.commit()
    return {"message": "User deleted"}


@router.put("/{user_id}/role")
async def update_user_role(
    user_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    roleIn: RoleIn = Body(...),
):
    if not has_permission(current_user.role.permissions, "update_user_role"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to update roles",
        )

    role = await get_role(roleIn.name, session)  # type: ignore
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    user = await get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role_id = role.id  # type: ignore

    await session.commit()
    return JSONResponse(
        {"message": f"Role updated to {roleIn.name.capitalize()}"}, status_code=200
    )


@router.put("/{user_id}/tier")
async def update_user_tier(
    user_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    tierIn: TierIn = Body(...),
):
    if not has_permission(current_user.role.permissions, "update_user_tier"):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to update user tiers",
        )

    if tierIn.tier < 1 or tierIn.tier > 4:
        raise HTTPException(
            status_code=400,
            detail="Tier must be between 1 and 4",
        )

    user = await get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.tier = tierIn.tier
    await session.commit()
    return {"message": f"Tier updated to {tierIn.tier}"}


@router.put("/{user_id}/group")
async def update_user_group(
    session: SessionDep,
    current_user: CurrentUser,
    user_id: int,
    group_id: int | None = None,
):
    if not has_permission(current_user.role.permissions, "update_user_group"):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update user groups",
        )

    user = await get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if group_id is None:
        user.group_id = None
    else:
        user.group_id = group_id

    await session.commit()
    return JSONResponse({"message": "Group updated"}, status_code=200)


class UpdatePasswordIn(BaseModel):
    current_password: str
    new_password: str


@router.put("/me/password")
async def update_password(
    session: SessionDep,
    current_user: CurrentUser,
    password: UpdatePasswordIn = Body(...),
):
    if not verify_password(password.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect password",
        )

    current_user.hashed_password = get_password_hash(password.new_password)
    await session.commit()
    return JSONResponse({"message": "Password updated"}, status_code=200)
