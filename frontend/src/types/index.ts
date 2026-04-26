// ─── Core Models ─────────────────────────────────────────

export type Role = "USER" | "ORGANIZER" | "ADMIN";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "FINISHED";
export type PlaceCategory =
  | "BAR"
  | "RESTAURANT"
  | "CULTURAL_CENTER"
  | "MUSEUM"
  | "PARK"
  | "CLUB"
  | "CAFE"
  | "GALLERY"
  | "THEATER"
  | "OTHER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  _count?: { events: number; places: number };
}

export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  _count?: { events: number; places: number };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  endDate?: string;
  price: number;
  isFree: boolean;
  capacity?: number;
  venue: string;
  address: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  status: EventStatus;
  category?: string;
  featured: boolean;
  ticketUrl?: string;
  cityId: string;
  city: { name: string };
  organizerId: string;
  organizer: { id: string; name: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: PlaceCategory;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  instagram?: string;
  openingHours?: Record<string, string>;
  rating?: number;
  priceRange?: string;
  tags: string[];
  featured: boolean;
  cityId: string;
  city: { name: string };
  ownerId?: string;
  owner?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ───────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } & T;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Query Params ─────────────────────────────────────────

export interface EventFilters {
  page?: number;
  limit?: number;
  category?: string;
  cityId?: string;
  featured?: boolean;
  search?: string;
  isFree?: boolean;
  sortBy?: "date" | "price" | "createdAt";
  order?: "asc" | "desc";
}

export interface PlaceFilters {
  page?: number;
  limit?: number;
  category?: PlaceCategory;
  cityId?: string;
  featured?: boolean;
  search?: string;
}

export interface SuggestionQuery {
  mood?: "tranquilo" | "fiestero" | "cultural" | "romántico" | "familiar";
  budget?: "bajo" | "medio" | "alto";
  timeOfDay?: "mañana" | "tarde" | "noche";
  groupType?: "solo" | "pareja" | "amigos" | "familia";
  cityId?: string;
}

export interface SuggestionResult {
  events: Event[];
  places: Place[];
  meta: {
    mood?: string;
    budget?: string;
    timeOfDay?: string;
    groupType?: string;
    text: string;
    totalResults: number;
  };
}

// ─── Form Types ───────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface CreateEventForm {
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  endDate?: string;
  price?: number;
  isFree: boolean;
  capacity?: number;
  venue: string;
  address: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  category?: string;
  ticketUrl?: string;
  cityId: string;
}
