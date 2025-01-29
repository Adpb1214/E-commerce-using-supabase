import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// New date formatting utility
export function formatDate(date: string | number | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(date))
}

// Alternative simple format if you prefer
export function formatSimpleDate(date: string | number | Date) {
  const d = new Date(date)
  return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`
}


