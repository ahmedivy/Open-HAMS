from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from sqlmodel import select

from api.deps import CurrentUser, SessionDep
from db.permissions import has_permission
from models import (
    Group,
    GroupIn,
    GroupWithZoo,
)

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("/")
async def get_groups(
    session: SessionDep, zoo_id: int | None = None
) -> list[GroupWithZoo]:
    query = select(Group).options(joinedload(Group.zoo))  # type: ignore
    if zoo_id is not None:
        query = query.where(Group.zoo_id == zoo_id)
    groups = await session.exec(query)
    return list(groups.all())  # type: ignore


@router.post("/")
async def create_group(group: GroupIn, session: SessionDep, current_user: CurrentUser):
    if not has_permission(current_user.role.permissions, "create_group"):
        raise HTTPException(
            status_code=403, detail="You do not have permission to create a group"
        )

    new_group = Group(title=group.title, zoo_id=group.zoo_id)  # type: ignore
    session.add(new_group)

    try:
        await session.commit()
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="A group with this title already exists in this zoo",
        )

    return JSONResponse({"message": "Group created"}, status_code=201)
