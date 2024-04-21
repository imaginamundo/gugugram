import { clsx, type ClassValue } from "clsx";

export default function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
