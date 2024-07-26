const API_URL: string =
  (import.meta as any).env.VITE_API_URL || "http://localhost:8000";

export { API_URL };

export const tiers = [
  { label: "Tier 1", value: "1" },
  { label: "Tier 2", value: "2" },
  { label: "Tier 3", value: "3" },
  { label: "Tier 4", value: "4" },
];
