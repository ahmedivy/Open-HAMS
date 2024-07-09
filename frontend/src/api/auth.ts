import { LoginSchema, SignUpSchema } from "@/api/schemas/auth";
import axios from "axios";
import { API_URL } from "./utils";

const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  timeoutErrorMessage: "Request timed out",
  validateStatus(_) {
    return true;
  },
});

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
