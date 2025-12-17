import { create } from "zustand";

export const useBboxStore = create((set) => ({
  bbox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  setBbox: (bbox) => set({ bbox }),
  clearBbox: () => set({ bbox: { x: 0, y: 0, width: 0, height: 0 } }),
}));
