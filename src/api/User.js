import { api } from "./axios";

export const getUser = async () => api.get("/api/v1/users");

export const PostLogin = async (email, password) => {
  return api.post("/api/v1/users/login", { email, password });
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export const getRefreshToken = async () => {
  const refreshToken = getCookie("refreshToken");

  return api.get("/api/v1/users/refresh");
};
