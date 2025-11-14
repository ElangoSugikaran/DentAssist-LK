import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAvatar(name: string, gender: "MALE" | "FEMALE") {
  const username = name.replace(/\s+/g, "").toLowerCase();
  const base = "https://avatar.iran.liara.run/public";
  if (gender === "FEMALE") return `${base}/girl?username=${username}`;
  // default to boy
  return `${base}/boy?username=${username}`;
}

// Sri Lanka phone formatting: 0XX XXX XXXX
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;

  // keep digits only
  const phone = value.replace(/[^\d]/g, "");
  const len = phone.length;

  // 0xx
  if (len <= 3) return phone;

  // 0xx xxx
  if (len <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;

  // 0xx xxx xxxx
  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)}`;
};

