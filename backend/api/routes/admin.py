import tempfile
from datetime import date

import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import select

from api.deps import CurrentUser, SessionDep
from db.permissions import has_permission
from models import Animal, Event, User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/reports", response_class=FileResponse)
async def get_reports(
    from_: date, to: date, entity: str, current_user: CurrentUser, session: SessionDep
):
    if not has_permission(current_user.role.permissions, "create_reports"):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    if entity not in ["events", "animals", "users"]:
        raise HTTPException(status_code=400, detail="Invalid entity")

    if entity == "animals":
        animals = await session.exec(
            select(Animal)
            .where(Animal.created_at >= from_)
            .where(Animal.created_at <= to)
        )
        animals = list(animals)

        # create csv file
        df = pd.DataFrame([animal.model_dump() for animal in animals])
    elif entity == "events":
        events = await session.exec(
            select(Event).where(Event.created_at >= from_).where(Event.created_at <= to)
        )
        events = list(events)

        # create csv file
        df = pd.DataFrame([event.model_dump() for event in events])
    elif entity == "users":
        users = await session.exec(
            select(User).where(User.created_at >= from_).where(User.created_at <= to)
        )
        users = list(users)

        # create csv file
        df = pd.DataFrame([user.model_dump() for user in users])

    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_file:
        tmp_file_name = tmp_file.name
        df.to_csv(tmp_file_name, index=False)

    # Return the file as a response
    response = FileResponse(
        tmp_file_name, media_type="text/csv", filename=f"{entity}.csv"
    )
    return response
