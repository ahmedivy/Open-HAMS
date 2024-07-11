import { EventType } from "@/utils/types";
import instance from "./axios";
import { EventTypeSchema } from "./schemas/event-type";

export async function update_event_type_group(
  event_id: number,
  group_id: string,
) {
  const res = await instance.put(`/event-type/${event_id}/group/${group_id}`);
  return res;
}

export async function update_event_type_zoo(event_id: number, zoo_id: string) {
  const res = await instance.put(`/event-type/${event_id}/zoo/${zoo_id}`);
  return res;
}

export async function getEventTypes(): Promise<EventType[]> {
  const res = await instance.get("/event-type/");
  return res.data as EventType[];
}

export async function createEventType(values: EventTypeSchema) {
  const res = await instance.post("/event-type/", values);
  return res;
}

export async function updateEventType(
  event_id: number,
  values: EventTypeSchema,
) {
  const res = await instance.put(`/event-type/${event_id}/`, values);
  return res;
}
