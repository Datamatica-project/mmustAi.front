import { api } from "./axios";

export const createProject = async (projectData) => {
  // labelRequests 형식 변환: {name, color} -> {name, hexColor}
  const labelRequests = projectData.classes.map((cls) => ({
    name: cls.name,
    hexColor: cls.color || cls.hexColor,
  }));

  // expiredAt을 ISO 8601 형식으로 변환
  let expiredAt = projectData.startDate;
  if (expiredAt && !expiredAt.includes("T")) {
    // "2025-12-04" 형식을 "2025-12-04T00:00:00.000Z"로 변환
    expiredAt = new Date(expiredAt + "T00:00:00").toISOString();
  }

  const Data = {
    name: projectData.projectName,
    description: projectData.description,
    labelRequests: labelRequests,
    category: "AUTO_LABELING",
    jobCountPerTask: Number(projectData.imagesPerTask) || 0, // 문자열을 숫자로 변환
    expiredAt: expiredAt,
    uploadedFileIds: projectData.uploadedFileIds || [],
    files: projectData.files || [],
  };
  console.log(Data);
  try {
    const response = await api.post("/api/v1/projects", Data);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const response = await api.get("/api/v1/projects");
    return response.data;
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

export const getProject = async (projectId) => {
  try {
    const response = await api.get(
      `/api/v1/projects/${projectId}/tasks/statistics`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

export const getBestWorker = async (projectId) => {
  try {
    const response = await api.get(
      `/api/v1/projects/${projectId}/bestworkers`,
      {
        params: {
          limit: 4,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting best worker:", error);
    throw error;
  }
};

export const getProjectTasks = async (projectId) => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/tasks`);
    return response.data;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

export const getTaskStatistics = async (taskId) => {
  try {
    const response = await api.get(
      `/api/v1/projects/tasks/${taskId}/statistics`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting task statistics:", error);
    throw error;
  }
};

export const getTaskImgList = async (taskId) => {
  try {
    const response = await api.get(`/api/v1/projects/tasks/${taskId}/jobs`, {
      params: {
        page: 1,
        size: 100,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting task img list:", error);
    throw error;
  }
};
