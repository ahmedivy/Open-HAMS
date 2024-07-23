import { EventWithCount, getEventDetails, getEvents } from "@/api/event";
import { useQuery } from "react-query";

import type { AnimalStatus } from "@/api/animals";
import {
  getAnimal,
  getAnimalAuditLog,
  getAnimalDetails,
  getAnimalsWithStatus,
} from "@/api/animals";
import { getGroups } from "@/api/group";
import { getAuthenticatedUser, getHandlers } from "@/api/user";
import { getZoos } from "@/api/zoo";
import {
  Animal,
  AnimalAuditWithDetails,
  AnimalWithEvents,
  EventWithDetails,
  Group,
  User,
  Zoo,
} from "@/utils/types";

import { getEventTypes } from "@/api/event-type";
import { getRoles } from "@/api/roles";
import { EventType, Role } from "@/utils/types";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: getAuthenticatedUser,
  });
}

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: getGroups,
  });
}

export function useHandlers() {
  return useQuery<User[]>({
    queryKey: ["handlers"],
    queryFn: getHandlers,
  });
}

export function useEvents() {
  return useQuery<EventWithCount[]>({
    queryKey: ["events"],
    queryFn: getEvents,
  });
}

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

export function useZoos() {
  return useQuery<Zoo[]>({
    queryKey: ["zoos"],
    queryFn: getZoos,
  });
}

export function useAnimalDetails(animalId: string) {
  return useQuery<AnimalWithEvents>({
    queryKey: ["animal_details", animalId],
    queryFn: () => getAnimalDetails(animalId),
  });
}

export function useAnimal(animalId: string) {
  return useQuery<Animal>({
    queryKey: ["animal", animalId],
    queryFn: () => getAnimal(animalId),
    enabled: !!animalId,
  });
}

export function useAnimalStatus(zoo_id?: string) {
  return useQuery<AnimalStatus[]>({
    queryFn: () => getAnimalsWithStatus(zoo_id),
    queryKey: ["animals", "statuses"],
  });
}

export function useEvent(eventId: string) {
  return useQuery<EventWithDetails>({
    queryKey: ["event", eventId],
    queryFn: () => getEventDetails(eventId),
    refetchOnMount: true,
  });
}

export function useAnimalAuditLog(animalId: string) {
  return useQuery<AnimalAuditWithDetails[]>({
    queryKey: ["animal-audit", animalId],
    queryFn: () => getAnimalAuditLog(animalId),
  });
}
