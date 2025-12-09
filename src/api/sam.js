import { samApi } from "./axios";

export const segmentImage = async (image, points, labels) => {
  console.log({ image, points, labels });
  try {
    const response = await samApi.post("/segment/point", {
      image,
      points,
      labels,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const segmentImageBbox = async (image, bbox) => {
  try {
    console.log("bbox", bbox);
    const response = await samApi.post("/segment/bbox", {
      image,
      bbox,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
