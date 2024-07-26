import { Role } from "@/utils/types";
import instance from "./axios";

export async function getRoles(): Promise<Role[]> {
  const res = await instance.get("/roles/");
  return res.data;
}
