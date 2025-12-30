import { api } from "./axios";

export const startAutoLabeling = async () => {
  const response = await api.post(`/api/v1/ai/demo/auto-labeling/start`);
  return response.data;
};
