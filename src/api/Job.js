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
  console.log(Data);
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

export const getObjectsByLabelId = async (labelId) => {
  try {
    const response = await api.get(`/api/v1/labels/${labelId}/objects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching objects by class id:", error);
    throw error;
  }
};

export const deleteObject = async (objectId) => {
  try {
    const response = await api.delete(`/api/v1/objects/${objectId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting object:", error);
    throw error;
  }
};

export const submitJob = async (jobId) => {
  try {
    const response = await api.patch(`/api/v1/jobs/${jobId}/submit`);
    return response.data;
  } catch (error) {
    console.error("Error submitting job:", error);
    throw error;
  }
};

export const approveJob = async (jobId) => {
  try {
    const response = await api.patch(`/api/v1/jobs/${jobId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving job:", error);
    throw error;
  }
};

export const rejectJob = async (jobId, feedback) => {
  const Data = {
    feedback: feedback,
  };
  try {
    const response = await api.patch(`/api/v1/jobs/${jobId}/reject`, Data);
    return response.data;
  } catch (error) {
    console.error("Error rejecting job:", error);
    throw error;
  }
};
