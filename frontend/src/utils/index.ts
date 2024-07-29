import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

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

export function formatTime(date?: string) {
  return new Date(date!).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
}

export function arraysEqual<T>(a: T[], b: T[]) {
  // compare arrays irrespective of order
  return a.length === b.length && a.map((x) => b.includes(x)).every(Boolean);
}

export function snakeToCapitalCase(str: string) {
  const words = str.split("_");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  const formattedStr = capitalizedWords.join(" ");
  return formattedStr;
}

export function getInitials(firstName: string, lastName?: string) {
  if (!firstName) return "U";

  if (lastName) {
    const initials = firstName[0] + lastName[0];
    return initials.toUpperCase();
  } else {
    const splits = firstName.split(" ");
    if (splits.length <= 2) return firstName.slice(0, 2).toUpperCase();
    const initials = splits[0][0] + splits[1][0];
    return initials.toUpperCase();
  }
}

export function timeSince(pastDate: string): string {
  const date = new Date(pastDate);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 0) {
    return "In the future";
  }

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hrs`;
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} mins`;
  }

  return "Just now";
}
export function timeTill(endingDate: string): string {
  const date = new Date(endingDate);
  const seconds = Math.floor((date.getTime() - new Date().getTime()) / 1000);

  if (seconds <= 0) {
    return "Already passed";
  }

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hrs`;
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} mins`;
  }

  return "some seconds";
}

type PermissionType =
  | "create_events"
  | "update_events"
  | "delete_events"
  | "view_events"
  | "add_animal"
  | "checkout_animals"
  | "checkin_animals"
  | "view_animals"
  | "update_animals"
  | "delete_animals"
  | "update_user_tier"
  | "update_user_role"
  | "update_user_group"
  | "add_animal_health_log"
  | "create_group"
  | "create_event_type"
  | "update_event_type"
  | "delete_event_type"
  | "update_group"
  | "create_reports"
  | "make_animal_unavailable"
  | "make_animal_available"
  | "delete_users"
  | "create_zoo"
  | "update_zoo"
  | "delete_zoo";

export function hasPermission(user: User, permission: PermissionType) {
  return user?.role?.permissions?.some((p) => p.name === permission);
}
