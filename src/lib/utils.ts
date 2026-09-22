import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class lists safely: later classes win over earlier ones
 * even when they target the same CSS property (e.g. two different `bg-*`).
 * Plain string concatenation can't do that; twMerge resolves the conflict,
 * clsx handles conditional/falsy values (cn("a", isOpen && "b")).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
