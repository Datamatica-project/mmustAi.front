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

export const useClassStore = create((set) => ({
  labelInfos: [],
  setLabelInfos: (labelInfos) => set({ labelInfos }),
  clearLabelInfos: () => set({ labelInfos: [] }),
  // 기존 호환성을 위한 별칭
  // class: [],
  // setClass: (labelInfos) => set({ labelInfos, class: labelInfos }),
  // clearClass: () => set({ labelInfos: [], class: [] }),
}));
