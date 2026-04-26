import api from "@/lib/api";
import type {
  Event,
  Place,
  City,
  User,
  EventFilters,
  PlaceFilters,
  SuggestionQuery,
  SuggestionResult,
  AuthResponse,
  LoginForm,
  RegisterForm,
  CreateEventForm,
} from "@/types";

// ─── Auth ─────────────────────────────────────────────────
export const authService = {
  login: async (data: LoginForm) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>("/auth/login", data);
    return res.data.data;
  },

  register: async (data: RegisterForm) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>("/auth/register", data);
    return res.data.data;
  },

  me: async () => {
    const res = await api.get<{ success: boolean; data: { user: User } }>("/auth/me");
    return res.data.data.user;
  },
};

// ─── Events ───────────────────────────────────────────────
export const eventsService = {
  getAll: async (filters?: EventFilters) => {
    const res = await api.get("/events", { params: filters });
    return res.data.data as { events: Event[]; pagination: any };
  },

  getFeatured: async () => {
    const res = await api.get("/events/featured");
    return res.data.data.events as Event[];
  },

  getById: async (id: string) => {
    const res = await api.get(`/events/${id}`);
    return res.data.data.event as Event;
  },

  create: async (data: CreateEventForm) => {
    const res = await api.post("/events", data);
    return res.data.data.event as Event;
  },

  update: async (id: string, data: Partial<CreateEventForm>) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data.data.event as Event;
  },

  delete: async (id: string) => {
    await api.delete(`/events/${id}`);
  },
};

// ─── Places ───────────────────────────────────────────────
export const placesService = {
  getAll: async (filters?: PlaceFilters) => {
    const res = await api.get("/places", { params: filters });
    return res.data.data as { places: Place[]; pagination: any };
  },

  getFeatured: async () => {
    const res = await api.get("/places/featured");
    return res.data.data.places as Place[];
  },

  getById: async (id: string) => {
    const res = await api.get(`/places/${id}`);
    return res.data.data.place as Place;
  },

  create: async (data: Partial<Place>) => {
    const res = await api.post("/places", data);
    return res.data.data.place as Place;
  },
};

// ─── Suggestions ──────────────────────────────────────────
export const suggestionsService = {
  get: async (query: SuggestionQuery) => {
    const res = await api.get("/suggestions", { params: query });
    return res.data.data as SuggestionResult;
  },
};

// ─── Cities ───────────────────────────────────────────────
export const citiesService = {
  getAll: async () => {
    const res = await api.get("/cities");
    return res.data.data.cities as City[];
  },
};
