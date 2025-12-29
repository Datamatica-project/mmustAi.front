import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("accessToken") || null,
  setToken: (token) => {
    set({ token });
    localStorage.setItem("accessToken", token); // 새로고침 대비 저장
  },
  clearToken: () => {
    set({ token: null });
    localStorage.removeItem("accessToken");
  },
}));

export const useProjectRolesStore = create((set) => ({
  projectRoles: localStorage.getItem("projectRoles") || null,
  setProjectRoles: (projectRoles) => {
    set({ projectRoles });
    localStorage.setItem("projectRoles", JSON.stringify(projectRoles));
  },
  clearProjectRoles: () => {
    set({ projectRoles: null });
    localStorage.removeItem("projectRoles");
  },
}));
