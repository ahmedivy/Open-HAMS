import { LoginSchema, SignUpSchema } from "@/lib/schemas/auth";
import instance from "./axios";

export async function register(values: SignUpSchema) {
  const res = await instance.post("/users/", values);
  return res;
}

export async function login(values: LoginSchema) {
  const res = await instance.post(
    "/users/login",
    new URLSearchParams(values).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (res.status === 200) {
    // Save the token to local storage
    localStorage.setItem("token", res.data.access_token);
  }

  return res;
}

export async function logout() {
  localStorage.removeItem("token");
}
