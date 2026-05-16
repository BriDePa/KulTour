import { create } from "zustand";
import type { FavoriteList, FavoriteListItem } from "@/types";

interface FavoriteListsState {
  lists: FavoriteList[];
  activeListId: string | null;
  setLists: (lists: FavoriteList[]) => void;
  setActiveList: (id: string | null) => void;
  addList: (list: FavoriteList) => void;
  updateList: (id: string, data: Partial<FavoriteList>) => void;
  removeList: (id: string) => void;
  addItemToList: (listId: string, item: FavoriteListItem) => void;
  removeItemFromList: (listId: string, itemId: string) => void;
}

export const useFavoriteListsStore = create<FavoriteListsState>((set) => ({
  lists: [],
  activeListId: null,
  setLists: (lists) => set({ lists }),
  setActiveList: (id) => set({ activeListId: id }),
  addList: (list) => set((state) => ({ lists: [list, ...state.lists] })),
  updateList: (id, data) =>
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),
  removeList: (id) =>
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
      activeListId: state.activeListId === id ? null : state.activeListId,
    })),
  addItemToList: (listId, item) =>
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId ? { ...l, items: [...(l.items || []), item] } : l
      ),
    })),
  removeItemFromList: (listId, itemId) =>
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId
          ? { ...l, items: l.items?.filter((i) => i.id !== itemId) }
          : l
      ),
    })),
}));