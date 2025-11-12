import { api } from "./axios";

export const getUser = async () => api.get("/api/v1/users");

export const PostLogin = async (email, password) => {
  return api.post("/api/v1/users/login", { email, password });
};

export const getRefreshToken = async () => api.get("/api/v1/users/refresh");
