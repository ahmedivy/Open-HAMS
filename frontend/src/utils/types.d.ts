import { components } from "./schema";

export type User = components["schemas"]["UserWithDetails"];
export type Role = components["schemas"]["RoleWithPermissions"]
export type Zoo = components["schemas"]["Zoo"]
export type Group = components["schemas"]["GroupWithZoo"]
export type EventType = components["schemas"]["EventType"]