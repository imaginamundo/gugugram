import { type ClassValue,clsx } from "clsx";

export default function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
