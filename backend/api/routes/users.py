from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, Query, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import select
from starlette.exceptions import HTTPException

from api.deps import CurrentUser, SessionDep
from core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from db.roles import get_role
from db.users import get_user_by_email, get_user_by_id, get_user_by_username
from db.utils import has_permission
from db.zoo import get_main_zoo
from models import User, UserWithDetails
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

    access_token_expires = timedelta(minutes=30)
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
    return list(handlers) # type: ignore


@router.delete("/")
async def delete_users(session: SessionDep, user: CurrentUser):
    if user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to delete users",
        )

    users = (await session.exec(select(User))).all()
    for user in users:
        await session.delete(user)
    await session.commit()
    return {"message": "All users deleted"}


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
async def get_user(
    user_id: int, session: SessionDep, _: CurrentUser
) -> UserWithDetails:
    user = await get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user  # type: ignore


@router.delete("/{user_id}")
async def delete_user(user_id: int, session: SessionDep, current_user: CurrentUser):
    if current_user.role.name != "admin" and current_user.id != user_id:
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
    if current_user.role.name != "admin":
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
    if not has_permission(current_user.role.permissions, "manage_users"):
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
    if not has_permission(current_user.role.permissions, "manage_users"):
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
