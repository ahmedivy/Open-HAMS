import { components } from "./schema";

export type User = components["schemas"]["UserWithDetails"];
export type Role = components["schemas"]["RoleWithPermissions"];
export type Zoo = components["schemas"]["Zoo"];
export type Group = components["schemas"]["GroupWithZoo"];
export type EventType = components["schemas"]["EventType"];
export type Animal = components["schemas"]["Animal"];
export type Event = components["schemas"]["Event"];
export type EventWithDetails = components["schemas"]["EventWithDetails"];

export type EventWithDetailsAndComments =
  components["schemas"]["EventWithDetailsAndComments"];

export type AnimalWithEvents = components["schemas"]["AnimalWithEvents"];
export type Comment = components["schemas"]["EventCommentWithUser"];
export type AnimalEventWithDetails = components["schemas"]["AnimalEventWithDetails"];
export type AnimalAuditWithDetails = components["schemas"]["AnimalAuditWithDetails"];