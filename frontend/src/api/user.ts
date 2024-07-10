import { User } from "@/utils/types";
import instance from "./axios";
import { UpdateProfileSchema } from "./schemas/auth";

export async function getAuthenticatedUser(): Promise<User> {
  const res = await instance.get("/users/me/");
  console.log(res.data);
  return res.data as User;
}

export async function updateUser(values: UpdateProfileSchema) {
  const res = await instance.put(`/users/me/`, values);
  return res;
}

export async function getUsers() {
  const res = await instance.get("/users/");
  console.log(res.data);
  return res.data as User[];
}

export async function getUser(userId: number) {
  const res = await instance.get(`/users/${userId}/`);
  return res.data as User;
}

export async function updateRole(userId: number, role: string) {
  const res = await instance.put(`/users/${userId}/role/`, { name: role });
  return res;
}

export async function updateTier(userId: number, tier: number) {
  const res = await instance.put(`/users/${userId}/tier/`, { tier });
  return res;
}
