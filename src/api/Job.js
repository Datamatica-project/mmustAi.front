import { api } from "./axios";
export const postObjectLabel = async (jobId, labelId, data, labelData) => {
  // 배열을 띄어쓰기로 연결된 문자열로 변환
  const jobDataText = Array.isArray(data) ? data.join(" ") : data;

  const Data = {
    name: labelData.objectName,
    workType: "MANUAL_LABELING",
    labelType: "BOUNDING_BOX",
    jobData: jobDataText,
  };
  const response = await api.post(
    `/api/v1/jobs/${jobId}/labels/${labelId}/objects`,
    Data
  );
  return response.data;
};

export const getJob = async (jobId) => {
  try {
    const response = await api.get(`/api/v1/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
};
