import { components } from "./schema";

export type User = components["schemas"]["UserWithRole"];
export type Role = components["schemas"]["RoleWithPermissions"]