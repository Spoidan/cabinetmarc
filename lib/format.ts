import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatBIF(amount: number): string {
  return new Intl.NumberFormat("fr-BI", {
    maximumFractionDigits: 0,
  }).format(amount) + " BIF";
}

export function formatDateFr(date: Date | string, pattern = "d MMMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: fr });
}

export function formatDateTimeFr(date: Date | string): string {
  return formatDateFr(date, "d MMMM yyyy 'à' HH'h'mm");
}

export function formatRelativeFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
