import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  REPUBLIC_ADMIN: 'Respublika Admin',
  REGION_ADMIN: 'Viloyat Admin',
  DISTRICT_ADMIN: 'Tuman Admin',
  MAHALLA_LEADER: 'Mahalla Yetakchisi',
  YOUTH: 'Yoshlar',
  MODERATOR: 'Moderator',
};

export const statusLabels: Record<string, string> = {
  NEW: 'Yangi',
  IN_PROGRESS: 'Jarayonda',
  RESOLVED: 'Hal qilingan',
  REJECTED: 'Rad etilgan',
  CLOSED: 'Yopilgan',
  OPEN: 'Ochiq',
  TODO: 'Rejada',
  DONE: 'Bajarilgan',
  CANCELLED: 'Bekor qilingan',
  DRAFT: 'Qoralama',
  UPCOMING: 'Rejalashtirilgan',
  ONGOING: 'Davom etmoqda',
  COMPLETED: 'Yakunlangan',
  ACTIVE: 'Faol',
};

export const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-blue-100 text-blue-800',
  TODO: 'bg-gray-100 text-gray-800',
  DONE: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  UPCOMING: 'bg-blue-100 text-blue-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  ACTIVE: 'bg-green-100 text-green-800',
};

export const priorityLabels: Record<string, string> = {
  LOW: 'Past',
  MEDIUM: "O'rta",
  HIGH: 'Yuqori',
  URGENT: 'Shoshilinch',
};

export const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};
