import { api } from "./axios";

export const getTaskDetail = async (taskId) => {
  try {
    const response = await api.get(`/api/v1/projects/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting task detail:", error);
    throw error;
  }
};
