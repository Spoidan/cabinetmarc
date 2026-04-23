import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date, locale = "fr-FR"): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale === "fr-FR" ? "Aujourd'hui" : "Today";
  if (diffDays === 1) return locale === "fr-FR" ? "Hier" : "Yesterday";
  if (diffDays < 7) return locale === "fr-FR" ? `Il y a ${diffDays} jours` : `${diffDays} days ago`;
  return formatDate(date, locale);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildSeoTitle(pageTitle: string, siteName = "Cabinet MARC"): string {
  return pageTitle ? `${pageTitle} | ${siteName}` : siteName;
}

export const SERVICES = [
  { value: "consulting", label: "Conseil & Consulting" },
  { value: "training", label: "Formation" },
  { value: "research", label: "Recherche" },
  { value: "elearning", label: "E-Learning" },
  { value: "other", label: "Autre" },
] as const;
