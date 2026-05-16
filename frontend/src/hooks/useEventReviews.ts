import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventReviewsService } from "@/services/api.service";

export function useEventReviews(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ["eventReviews", eventId],
    queryFn: () => eventReviewsService.getByEvent(eventId),
    enabled,
  });
}

export function useCreateEventReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, rating, comment }: { eventId: string; rating: number; comment?: string }) =>
      eventReviewsService.create(eventId, rating, comment),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["eventReviews", eventId] });
    },
  });
}

export function useUpdateEventReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment?: string }) =>
      eventReviewsService.update(id, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventReviews"] });
    },
  });
}

export function useDeleteEventReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventReviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventReviews"] });
    },
  });
}

export function useMyEventReviews() {
  return useQuery({
    queryKey: ["myEventReviews"],
    queryFn: () => eventReviewsService.getMyReviews(),
  });
}