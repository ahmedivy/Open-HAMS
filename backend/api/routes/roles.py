from fastapi import APIRouter
from sqlmodel import select

from api.deps import SessionDep
from models import Role, RoleWithPermissions

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("/")
async def get_roles(session: SessionDep) -> list[RoleWithPermissions]:
    return (await session.exec(select(Role))).all()  # type: ignore
