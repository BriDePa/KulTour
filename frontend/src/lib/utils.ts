import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(dateStr).toLocaleDateString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(price: number, isFree: boolean) {
  if (isFree || price === 0) return "Gratuito";
  return `Bs. ${price.toFixed(0)}`;
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.substring(0, n - 1) + "…" : str;
}

export const PLACE_CATEGORY_LABELS: Record<string, string> = {
  BAR: "Bar",
  RESTAURANT: "Restaurante",
  CULTURAL_CENTER: "Centro Cultural",
  MUSEUM: "Museo",
  PARK: "Parque",
  CLUB: "Club / Discoteca",
  CAFE: "Café",
  GALLERY: "Galería",
  THEATER: "Teatro",
  OTHER: "Otro",
};

export const EVENT_CATEGORIES = [
  "Música",
  "Arte y Cultura",
  "Gastronomía",
  "Noche",
  "Turismo",
  "Deportes",
  "Tecnología",
  "Educación",
  "Familiar",
  "Social",
];
