// src/lib/date-utils.ts
import { formatDistanceToNow, format } from "date-fns";

export const formatters = {
  timeAgo: (date: Date | string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true }),

  shortDate: (date: Date | string) => format(new Date(date), "MMM dd, yyyy"),

  longDate: (date: Date | string) => format(new Date(date), "MMMM dd, yyyy"),

  dateTime: (date: Date | string) =>
    format(new Date(date), "MMM dd, yyyy 'at' h:mm a"),

  inputDate: (date: Date | string) => format(new Date(date), "yyyy-MM-dd"),
};

export function getRelativeTimeString(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} day${
      Math.abs(diffInDays) > 1 ? "s" : ""
    } overdue`;
  } else if (diffInDays === 0) {
    return "Due today";
  } else if (diffInDays <= 7) {
    return `Due in ${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  } else {
    return formatters.shortDate(date);
  }
}
