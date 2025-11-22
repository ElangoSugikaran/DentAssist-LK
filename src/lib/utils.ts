import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateAvatar(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _gender: "MALE" | "FEMALE"
) {
  // Using ui-avatars.com - more reliable and faster
  // URL encodes the name and uses initials
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=128`;
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

// Get next 5 days from today
export const getNext5Days = () => {
  const dates = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

// Available time slots for appointments
export const getAvailableTimeSlots = () => {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
};

// Appointment types with durations and prices
export const APPOINTMENT_TYPES = [
  { id: "checkup", name: "Regular Checkup", duration: "60 min", price: "$120" },
  { id: "cleaning", name: "Teeth Cleaning", duration: "45 min", price: "$90" },
  { id: "consultation", name: "Consultation", duration: "30 min", price: "$75" },
  { id: "emergency", name: "Emergency Visit", duration: "30 min", price: "$150" },
];

