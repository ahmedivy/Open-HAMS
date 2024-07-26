from datetime import UTC, datetime, timedelta

import sqlalchemy as sa
from sqlalchemy.types import TIMESTAMP
from sqlmodel import Field


def created_at_field() -> datetime:
    return Field(
        sa_column=sa.Column(
            default=lambda: datetime.now(UTC),
            type_=TIMESTAMP(timezone=True),
        )
    )


def updated_at_field() -> datetime:
    return Field(
        sa_column=sa.Column(
            default=lambda: datetime.now(UTC),
            onupdate=lambda: datetime.now(UTC),
            type_=TIMESTAMP(timezone=True),
        )
    )


def time_since(delta: timedelta) -> str:
    if delta.days > 0:
        return f"{delta.days} days"
    elif delta.seconds > 3600:
        return f"{delta.seconds // 3600}hrs"
    elif delta.seconds > 60:
        return f"{delta.seconds // 60}mins"
    else:
        return f"{delta.seconds} seconds"
