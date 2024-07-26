import {
  Event,
  EventType,
  EventWithDetails,
  EventWithDetailsAndComments,
  UpcomingLiveEvents,
} from "@/utils/types";
import instance from "./axios";
import { TrasformedEventSchema } from "./schemas/event";

export type EventWithCount = {
  event: Event;
  event_type: EventType;
  animal_count: number;
};

export async function getEvents() {
  const res = await instance.get("/events");
  return res.data as EventWithCount[];
}

export async function getEventsDetails(date: Date) {
  const res = await instance.get(`/events/details`, {
    params: {
      _date: date.toISOString().split("T")[0],
    },
  });

  console.log("Date", date);

  return res.data as EventWithDetailsAndComments[];
}

export type CreateEventSchema = {
  event: TrasformedEventSchema;
  user_ids: string[];
  animal_ids: string[];
  checkout_immediately: boolean;
};

export async function createEvent(values: CreateEventSchema) {
  const res = await instance.post("/events", values);
  return res;
}

export async function updateEvent(values: CreateEventSchema, eventId: string) {
  const res = await instance.put(`/events/${eventId}`, values);
  return res;
}

export async function getUpcomingLiveEvents() {
  const res = await instance.get("/events/details/upcoming-live");
  return res.data as UpcomingLiveEvents;
}

export async function deleteEvent(id: string) {
  const res = await instance.delete(`/events/${id}`);
  return res;
}

export async function getEventDetails(id: string) {
  const res = await instance.get(`/events/${id}`);
  return res.data as EventWithDetails;
}

export async function addComment(eventId: string, comment: string) {
  const res = await instance.post(`/events/${eventId}/comments`, { comment });
  return res;
}

export async function reAssignAnimalsToEvent(
  eventId: string,
  animalIds: string[],
) {
  const res = await instance.put(`/events/${eventId}/animals`, {
    animal_ids: animalIds,
  });
  return res;
}

export async function reAssignHandlersToEvent(
  eventId: string,
  handlerIds: string[],
) {
  const res = await instance.put(`/events/${eventId}/handlers`, {
    user_ids: handlerIds,
  });
  return res;
}

export async function checkoutAnimals(eventId: string, animalIds: string[]) {
  const res = await instance.put(`/events/${eventId}/checkout`, {
    animal_ids: animalIds,
  });
  return res;
}

export async function checkinAnimals(eventId: string, animalIds: string[]) {
  const res = await instance.put(`/events/${eventId}/checkin`, {
    animal_ids: animalIds,
  });
  return res;
}
