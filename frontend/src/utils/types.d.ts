import { components } from "./schema";

type schemas = components["schemas"];

export type User = schemas["UserWithDetails"];
export type Role = schemas["RoleWithPermissions"];
export type Zoo = schemas["Zoo"];
export type Group = schemas["GroupWithZoo"];
export type EventType = schemas["EventType"];
export type Animal = schemas["Animal"];
export type Event = schemas["Event"];
export type EventWithDetails = schemas["EventWithDetails"];
export type EventWithDetailsAndComments =
  schemas["EventWithDetailsAndComments"];
export type AnimalWithEvents = schemas["AnimalWithEvents"];
export type Comment = schemas["EventCommentWithUser"];
export type AnimalEventWithDetails = schemas["AnimalEventWithDetails"];
export type AnimalAuditWithDetails = schemas["AnimalAuditWithDetails"];
export type AnimalHealthLogWithDetails = schemas["AnimalHealthLogWithDetails"];
export type UpcomingLiveEvents = schemas["GetUpcomingLiveEvents"];
export type AnimalWithCurrentEvent = schemas["AnimalWithCurrentEvent"];
export type RestingAnimal = schemas["RestingAnimal"];

export type HealthLog = schemas["AnimalHealthLogWithDetails"];
export type UserWithEvents = schemas["UserWithEvents"];

export type AnimalFeed = schemas["FeedEvent"];
