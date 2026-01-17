import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {jwtDecode} from "jwt-decode";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const isTokenExpired = (token: string) => {
  const decodedToken = jwtDecode<{ exp: number }>(token);
  const currentTime = Date.now() / 1000;
  return decodedToken?.exp < currentTime;
};


