import { create } from "zustand";

export const usePlacedObjectsStore = create((set) => ({
  placedObjects: [],
  setPlacedObjects: (updater) =>
    set((state) => ({
      placedObjects:
        typeof updater === "function" ? updater(state.placedObjects) : updater,
    })),
  clearPlacedObjects: () => set({ placedObjects: [] }),
}));
