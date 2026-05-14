import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Favorite } from "@/types";

interface FavoritesState {
  favorites: Favorite[];
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (eventId?: string, placeId?: string) => boolean;
  getFavoriteId: (eventId?: string, placeId?: string) => string | undefined;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (favorite) =>
        set((state) => ({
          favorites: [...state.favorites, favorite],
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      clearFavorites: () => set({ favorites: [] }),

      isFavorite: (eventId, placeId) => {
        return get().favorites.some(
          (f) =>
            (eventId && f.eventId === eventId) ||
            (placeId && f.placeId === placeId)
        );
      },

      getFavoriteId: (eventId, placeId) => {
        const found = get().favorites.find(
          (f) =>
            (eventId && f.eventId === eventId) ||
            (placeId && f.placeId === placeId)
        );
        return found?.id;
      },
    }),
    {
      name: "kultour_favorites",
    }
  )
);