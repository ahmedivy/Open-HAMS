import instance from "./axios";
import { GroupSchema } from "./schemas/group";

export async function createGroup(values: GroupSchema) {
  const res = await instance.post("/groups", values);
  return res;
}
