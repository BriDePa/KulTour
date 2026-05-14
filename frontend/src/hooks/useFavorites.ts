import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesService } from "@/services/api.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["favorites"],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToastStore();
  const { addFavorite } = useFavoritesStore();

  return useMutation({
    mutationFn: (data: { eventId?: string; placeId?: string }) =>
      favoritesService.add(data.eventId, data.placeId),
    onSuccess: (favorite) => {
      addFavorite(favorite);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      success("Guardado", "Se agregó a tus favoritos");
    },
    onError: (err: any) => {
      toastError(
        "Error",
        err?.response?.data?.message || "No se pudo guardar"
      );
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToastStore();
  const { removeFavorite } = useFavoritesStore();

  return useMutation({
    mutationFn: (id: string) => favoritesService.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData(["favorites"]);
      queryClient.setQueryData(["favorites"], (old: any) => ({
        ...old,
        favorites: old?.favorites?.filter((f: any) => f.id !== id),
      }));
      removeFavorite(id);
      return { previous };
    },
    onError: (err: any, id, context) => {
      queryClient.setQueryData(["favorites"], context?.previous);
      toastError(
        "Error",
        err?.response?.data?.message || "No se pudo quitar de favoritos"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onSuccess: () => {
      success("Eliminado", "Se quitó de tus favoritos");
    },
  });
}

export function useToggleFavorite() {
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { favorites } = useFavoritesStore();

  return (eventId?: string, placeId?: string) => {
    const existing = favorites.find(
      (f) =>
        (eventId && f.eventId === eventId) ||
        (placeId && f.placeId === placeId)
    );

    if (existing) {
      removeFavorite.mutate(existing.id);
    } else {
      addFavorite.mutate({ eventId, placeId });
    }
  };
}