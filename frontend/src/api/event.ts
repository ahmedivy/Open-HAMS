import { Event, EventType } from "@/utils/types";
import instance from "./axios";

export type EventWithCount = {
  event: Event;
  event_type: EventType;
  animal_count: number;
};

export async function getEvents() {
  const res = await instance.get("/events");
  return res.data as EventWithCount[];
}
