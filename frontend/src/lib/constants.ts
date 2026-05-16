export const APP_NAME = "Kultour";
export const DEFAULT_CITY = "La Paz";
export const DEFAULT_COUNTRY = "Bolivia";
export const DEFAULT_CITY_FULL = "La Paz, Bolivia";

export const CITIES = {
  LA_PAZ: "La Paz",
  EL_ALTO: "El Alto",
  SANTA_CRUZ: "Santa Cruz",
  COCHABAMBA: "Cochabamba",
} as const;

export const EVENT_CATEGORIES = [
  "Música",
  "Arte y Cultura",
  "Gastronomía",
  "Noche",
  "Turismo",
  "Deportes",
  "Familiar",
] as const;

export const PLACE_CATEGORIES = {
  BAR: "Bar",
  RESTAURANT: "Restaurante",
  CULTURAL_CENTER: "Centro Cultural",
  MUSEUM: "Museo",
  PARK: "Parque",
  CLUB: "Club",
  CAFE: "Café",
  GALLERY: "Galería",
  THEATER: "Teatro",
  OTHER: "Otro",
} as const;

export const RECURRENCE_LABELS = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
} as const;

export const SORT_OPTIONS = {
  DATE: "date",
  PRICE: "price",
  CREATED: "createdAt",
} as const;

export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 50;
export const DEBOUNCE_DELAY = 500;