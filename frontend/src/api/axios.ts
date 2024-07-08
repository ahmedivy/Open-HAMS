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

export default instance;
