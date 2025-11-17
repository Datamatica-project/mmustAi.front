import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("accessToken") || null,
  token: null,
  setToken: (token) => {
    set({ token });
    localStorage.setItem("accessToken", token); // 새로고침 대비 저장
  },
  clearToken: () => {
    set({ token: null });
    localStorage.removeItem("accessToken");
  },
}));
