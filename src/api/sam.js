import { samApi } from "./axios";

export const segmentImage = async (image, points, labels) => {
  try {
    const response = await samApi.post("/segment", { image, points, labels });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
