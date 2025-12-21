import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 세션 쿠키를 사용해 인증을 유지하는 구조일때 자동 첨부
});

export const samApi = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

// 요청 인터셉터: 토큰을 헤더에 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 에러 처리 (토큰 만료/무효)
api.interceptors.response.use(
  (response) => response, // 성공 응답은 그대로 반환
  (error) => {
    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      const { clearToken } = useAuthStore.getState();
      // 토큰 삭제
      clearToken();
      // 로그인 페이지로 리다이렉트 (브라우저 환경에서만)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
