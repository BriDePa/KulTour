import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/services/api.service";
import { useToastStore } from "@/store/toastStore";

export function useReviews(placeId: string) {
  return useQuery({
    queryKey: ["reviews", placeId],
    queryFn: () => reviewsService.getByPlace(placeId),
    enabled: !!placeId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToastStore();

  return useMutation({
    mutationFn: (data: { placeId: string; rating: number; comment: string }) =>
      reviewsService.create(data.placeId, data.rating, data.comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.placeId] });
      success("Reseña publicada", "Gracias por tu opinión");
    },
    onError: (err: any) => {
      toastError(
        "Error",
        err?.response?.data?.message || "No se pudo publicar la reseña"
      );
    },
  });
}

export function useAverageRating(placeId: string) {
  const { data, isLoading, error } = useReviews(placeId);
  const average = data?.stats?.average ?? 0;
  
  return {
    data: average,
    isLoading,
    error,
  } as const;
}