import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(date?: string) {
  return (
    new Date(date!).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) || "N/A"
  );
}
