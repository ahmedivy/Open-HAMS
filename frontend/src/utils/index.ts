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

export function formatTime(date?: string) {
  return new Date(date!).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}

export function arraysEqual<T>(a: T[], b: T[]) {
  // compare arrays irrespective of order
  return a.length === b.length && a.map((x) => b.includes(x)).every(Boolean);
}

export function timeSince(data: string) {
  const date = new Date(data);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years ago";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes ago";
  }
  return "Just now";
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
