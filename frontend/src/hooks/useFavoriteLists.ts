import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteListsService } from "@/services/api.service";
import { useFavoriteListsStore } from "@/store/favoriteListsStore";

export function useFavoriteLists() {
  const setLists = useFavoriteListsStore((state) => state.setLists);

  return useQuery({
    queryKey: ["favoriteLists"],
    queryFn: async () => {
      const lists = await favoriteListsService.getAll();
      setLists(lists);
      return lists;
    },
  });
}

export function useCreateFavoriteList() {
  const queryClient = useQueryClient();
  const addList = useFavoriteListsStore((state) => state.addList);

  return useMutation({
    mutationFn: ({ name, description, isPublic }: { name: string; description?: string; isPublic?: boolean }) =>
      favoriteListsService.create(name, description, isPublic),
    onSuccess: (data) => {
      addList(data);
      queryClient.invalidateQueries({ queryKey: ["favoriteLists"] });
    },
  });
}

export function useUpdateFavoriteList() {
  const queryClient = useQueryClient();
  const updateList = useFavoriteListsStore((state) => state.updateList);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; isPublic?: boolean } }) =>
      favoriteListsService.update(id, data),
    onSuccess: (data, { id }) => {
      updateList(id, data);
      queryClient.invalidateQueries({ queryKey: ["favoriteLists"] });
    },
  });
}

export function useDeleteFavoriteList() {
  const queryClient = useQueryClient();
  const removeList = useFavoriteListsStore((state) => state.removeList);

  return useMutation({
    mutationFn: (id: string) => favoriteListsService.delete(id),
    onSuccess: (_, id) => {
      removeList(id);
      queryClient.invalidateQueries({ queryKey: ["favoriteLists"] });
    },
  });
}

export function useAddToList() {
  const queryClient = useQueryClient();
  const addItemToList = useFavoriteListsStore((state) => state.addItemToList);

  return useMutation({
    mutationFn: ({ listId, eventId, placeId }: { listId: string; eventId?: string; placeId?: string }) =>
      favoriteListsService.addItem(listId, eventId, placeId),
    onSuccess: (data, { listId }) => {
      addItemToList(listId, data);
      queryClient.invalidateQueries({ queryKey: ["favoriteLists"] });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();
  const removeItemFromList = useFavoriteListsStore((state) => state.removeItemFromList);

  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      favoriteListsService.removeItem(listId, itemId),
    onSuccess: (_, { listId, itemId }) => {
      removeItemFromList(listId, itemId);
      queryClient.invalidateQueries({ queryKey: ["favoriteLists"] });
    },
  });
}

export function useListItems(listId: string) {
  return useQuery({
    queryKey: ["favoriteListItems", listId],
    queryFn: () => favoriteListsService.getItems(listId),
    enabled: !!listId,
  });
}