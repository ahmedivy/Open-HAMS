import axios from "axios";
import { API_URL } from "./utils";

const instance = axios.create({
  baseURL: API_URL,
  timeout: 40000,
  headers: {
    "Content-Type": "application/json",
  },
  timeoutErrorMessage: "Request timed out",
  validateStatus(code) {
    return true;
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject;
  },
);

export default instance;
