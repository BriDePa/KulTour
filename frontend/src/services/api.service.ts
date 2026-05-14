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
  Favorite,
  Review,
  Notification,
  SearchResult,
  UpdateProfileForm,
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

// ─── Favorites ─────────────────────────────────────────────
export const favoritesService = {
  getAll: async () => {
    const res = await api.get("/favorites");
    return res.data.data.favorites as Favorite[];
  },

  add: async (eventId?: string, placeId?: string) => {
    const res = await api.post("/favorites", { eventId, placeId });
    return res.data.data.favorite as Favorite;
  },

  remove: async (id: string) => {
    await api.delete(`/favorites/${id}`);
  },

  check: async (eventId?: string, placeId?: string) => {
    const params: Record<string, string> = {};
    if (eventId) params.eventId = eventId;
    if (placeId) params.placeId = placeId;
    const res = await api.get("/favorites/check", { params });
    return res.data.data.isFavorite as boolean;
  },
};

// ─── Reviews ───────────────────────────────────────────────
export const reviewsService = {
  getByPlace: async (placeId: string, page = 1, limit = 10) => {
    const res = await api.get(`/reviews/place/${placeId}`, { params: { page, limit } });
    return res.data.data as { reviews: Review[]; pagination: any; stats: { average: number; total: number } };
  },

  create: async (placeId: string, rating: number, comment: string) => {
    const res = await api.post("/reviews", { placeId, rating, comment });
    return res.data.data.review as Review;
  },
};

// ─── Notifications ─────────────────────────────────────────
export const notificationsService = {
  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data.data.notifications as Notification[];
  },

  markRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllRead: async () => {
    await api.patch("/notifications/read-all");
  },
};

// ─── Search ─────────────────────────────────────────────────
export const searchService = {
  global: async (query: string) => {
    const res = await api.get("/search", { params: { q: query } });
    return res.data.data as SearchResult;
  },
};

// ─── Upload ─────────────────────────────────────────────────
export const uploadService = {
  image: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url as string;
  },
};

// ─── Profile ────────────────────────────────────────────────
export const profileService = {
  update: async (data: UpdateProfileForm) => {
    const res = await api.put("/profile", data);
    return res.data.data.user as User;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    await api.post("/profile/change-password", { oldPassword, newPassword });
  },

  deleteAccount: async () => {
    await api.delete("/profile");
  },
};
