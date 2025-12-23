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

/**
 * 프로젝트에 팀원 초대
 * @param {string} projectId - 프로젝트 ID
 * @param {Array} members - 초대할 멤버 배열 [{ email, role }, ...]
 * @returns {Promise}
 */
export const inviteMembers = async (projectId, members, tasks) => {
  const VisitData = {
    email: members[0].email,
    role: members[0].role,
    projectId: +projectId,
    taskId: +tasks,
  };
  
  try {
    const response = await api.post(`/api/v1/users/invite`, VisitData);
    return response.data;
  } catch (error) {
    console.error("Error inviting members:", error);

    if (error.response) {
      const serverMessage =
        error.response.data?.message ||
        error.resopnse.data?.errorCode ||
        "Unknown error";
      throw new Error(serverMessage);
    }
    throw error;
  }
};

/**
 * 오토라벨링 시작
 * @param {string} projectId - 프로젝트 ID
 * @returns {Promise}
 */
export const startAutoLabeling = async (projectId) => {
  try {
    const response = await api.post(
      `/api/v1/projects/${projectId}/auto-labeling/start`
    );
    return response.data;
  } catch (error) {
    console.error("Error starting auto labeling:", error);
    throw error;
  }
};

/**
 * 오토라벨링 상태 조회
 * @param {string} projectId - 프로젝트 ID
 * @returns {Promise}
 */
export const getAutoLabelingStatus = async (projectId) => {
  try {
    const response = await api.get(
      `/api/v1/projects/${projectId}/auto-labeling/status`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting auto labeling status:", error);
    throw error;
  }
};

/**
 * 오토라벨링 Cycle 결과 조회
 * @param {string} projectId - 프로젝트 ID
 * @param {number} cycleIndex - 사이클 번호 (1, 2, 3)
 * @returns {Promise}
 */
export const getAutoLabelingCycleResult = async (projectId, cycleIndex) => {
  try {
    const response = await api.get(
      `/api/v1/projects/${projectId}/auto-labeling/cycle/${cycleIndex}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting cycle result:", error);
    throw error;
  }
};

export const getMembers = async (projectId) => {
  try {
    const response = await api.get(`/api/v1/users`, {
      params: {
        page: 1,
        size: 100,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting members:", error);
    throw error;
  }
};

export const deleteProjectFile = async (projectId) => {
  try {
    const response = await api.delete(`/api/v1/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting task image:", error);
    throw error;
  }
};
