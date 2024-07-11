import { getEventTypes } from "@/api/event-type";
import { getRoles } from "@/api/roles";
import { EventType, Role } from "@/utils/types";
import { useQuery } from "react-query";

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
}

export function useEventType() {
  return useQuery<EventType[]>({
    queryKey: ["eventTypes"],
    queryFn: getEventTypes,
  });
}
