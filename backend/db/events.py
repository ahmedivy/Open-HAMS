from sqlalchemy.orm import joinedload
from sqlmodel import col, select

from models import (
    AnimalEvent,
    AnimalEventWithDetails,
    Event,
    EventComment,
    EventCommentWithUser,
    EventWithDetailsAndComments,
    UserEvent,
    UserEventWithDetails,
)


async def get_all_events(session, zoo_id: int | None = None) -> list[Event]:
    if zoo_id:
        events = await session.exec(select(Event).where(Event.zoo_id == zoo_id))
    else:
        events = await session.exec(select(Event))

    return events.all()


async def get_event_by_id(id: int, session) -> Event | None:
    event = (await session.exec(select(Event).where(Event.id == id))).first()
    return event


async def get_events_details(session, events: list[Event]):
    event_ids = [event.id for event in events]

    event_animal_details = await session.exec(
        select(AnimalEvent)
        .where(col(AnimalEvent.event_id).in_(event_ids))
        .options(
            joinedload(AnimalEvent.animal),  # type: ignore
        )
    )
    event_animal_details = list(event_animal_details.unique())

    event_user_details = await session.exec(
        select(UserEvent)
        .where(col(UserEvent.event_id).in_(event_ids))
        .options(
            joinedload(UserEvent.user),  # type: ignore
        )
    )
    event_user_details = list(event_user_details.unique())

    events_comments = await session.exec(
        select(EventComment)
        .where(col(EventComment.event_id).in_(event_ids))
        .options(
            joinedload(EventComment.user)  # type: ignore
        )
    )
    events_comments = list(events_comments.unique())

    events_with_details: list[EventWithDetailsAndComments] = []
    for event in events:
        event_details = EventWithDetailsAndComments(
            event=event,
            animals=[
                AnimalEventWithDetails(
                    animal_event=animal_event, animal=animal_event.animal
                )
                for animal_event in event_animal_details
                if animal_event.event_id == event.id
            ],
            users=[
                UserEventWithDetails(user_event=user_event, user=user_event.user)
                for user_event in event_user_details
                if user_event.event_id == event.id
            ],
            comments=[
                EventCommentWithUser(user=event_comment.user, comment=event_comment)
                for event_comment in events_comments
                if event_comment.event_id == event.id
            ],
            event_type=event.event_type,
            zoo=event.zoo,
        )
        events_with_details.append(event_details)

    return events_with_details
