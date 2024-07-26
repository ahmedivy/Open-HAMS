import { Zoo } from "@/utils/types";
import instance from "./axios";

export async function getZoos(): Promise<Zoo[]> {
  const res = await instance.get("/zoo/");
  return res.data as Zoo[];
}
