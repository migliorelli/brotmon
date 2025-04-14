import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tryCatch(fn: Function, error: string) {
  try {
    fn();
    return true;
  } catch {
    console.error(error);
    return false;
  }
}
