import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService, placesService, suggestionsService, citiesService, searchService, uploadService } from "@/services/api.service";
import type { EventFilters, PlaceFilters, SuggestionQuery, CreateEventForm } from "@/types";

// ─── Events Hooks ─────────────────────────────────────────
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventsService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: eventsService.getFeatured,
    staleTime: 1000 * 60 * 10,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventForm) => eventsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ─── Places Hooks ─────────────────────────────────────────
export function usePlaces(filters?: PlaceFilters) {
  return useQuery({
    queryKey: ["places", filters],
    queryFn: () => placesService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedPlaces() {
  return useQuery({
    queryKey: ["places", "featured"],
    queryFn: placesService.getFeatured,
    staleTime: 1000 * 60 * 10,
  });
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: ["place", id],
    queryFn: () => placesService.getById(id),
    enabled: !!id,
  });
}

// ─── Suggestions Hook ─────────────────────────────────────
export function useSuggestions(query: SuggestionQuery, enabled = false) {
  return useQuery({
    queryKey: ["suggestions", query],
    queryFn: () => suggestionsService.get(query),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Cities Hook ──────────────────────────────────────────
export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: citiesService.getAll,
    staleTime: 1000 * 60 * 60,
  });
}

// ─── Search Hook ───────────────────────────────────────────
export function useSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchService.global(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 1000 * 60,
  });
}

// ─── Upload Hook ────────────────────────────────────────────
export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadService.image(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
}
