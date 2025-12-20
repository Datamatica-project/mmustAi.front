import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 세션 쿠키를 사용해 인증을 유지하는 구조일때 자동 첨부
});

export const samApi = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

// 토큰(JWT 등)을 헤더에 직접 실어서 인증을 유지하는 구조일때 사용
api.interceptors.request.use((config) => {
  // const token = useAuthStore.getState().token;
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
