const API_URL: string =
  (import.meta as any).env.VITE_API_URL || "http://localhost:8000";

export { API_URL };
