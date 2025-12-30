import { api } from "./axios";

/**
 * 청크 파일 업로드 초기화
 * @param {Object} fileInfo - 파일 정보
 * @param {string} fileInfo.filename - 파일명
 * @param {number} fileInfo.fileSize - 파일 크기 (bytes)
 * @param {number} fileInfo.totalChunks - 총 청크 개수
 * @param {string} fileInfo.pathType - 경로 타입 (예: "PROJECT")
 * @param {string} fileInfo.contentType - MIME 타입
 * @returns {Promise} { fileId, status, ... }
 */

// 청크 파일 업로드 초기화
export const initChunkUpload = async (fileInfo, CHUNK_SIZE) => {
  const fileData = fileInfo.map((file) => {
    return {
      filename: file.file.name,
      fileSize: file.file.size,
      totalChunks: Math.ceil(file.file.size / CHUNK_SIZE),
      pathType: "PROJECT",
      contentType: file.file.type,
    };
  });

  try {
    const response = await api.post("/api/v1/files/upload/init", fileData[0]);
    return response.data;
  } catch (error) {
    console.error("Init chunk upload error:", error);
    throw error;
  }
};

/**
 * 청크 파일 업로드
 * @param {string} fileId - 파일 ID
 * @param {number} chunkNumber - 청크 번호 (0부터 시작)
 * @param {number} totalChunks - 총 청크 개수
 * @param {string} chunkData - base64 인코딩된 청크 데이터
 * @returns {Promise} { fileId, status, uploadedChunks, progress, ... }
 */

// 파일 업로드
export const uploadChunk = async (
  fileId,
  chunkNumber,
  totalChunks,
  chunkData
) => {
  const formData = new FormData();
  formData.append("fileId", fileId);
  formData.append("chunkNumber", chunkNumber);
  formData.append("totalChunks", totalChunks);
  formData.append("chunk", chunkData);
  try {
    const response = await api.post(`/api/v1/files/upload/chunk`, formData);
    return response.data;
  } catch (error) {
    console.error("Upload chunk error:", error);
    throw error;
  }
};

/**
 * 청크 파일 업로드 완료
 * @param {string} fileId - 파일 ID
 * @returns {Promise} { fileId, status, storedFilename, ... }
 */
export const completeChunkUpload = async (fileId) => {
  try {
    const response = await api.post(
      `/api/v1/files/upload/complete?fileId=${fileId}`
    );
    return response.data;
  } catch (error) {
    console.error("Complete chunk upload error:", error);
    throw error;
  }
};

/**
 * 통합 파일 업로드 (청크 업로드 없이 직접 업로드)
 * @param {File[]} files - 업로드할 파일 배열
 * @param {string} type - 파일 저장 타입 (PROJECT, PREPROCESSING, PREPROCESSING_PROCESSED)
 * @param {Function} onProgress - 진행률 콜백 함수 (fileIndex, progress)
 * @returns {Promise<string[]>} 파일 ID 배열
 */
export const uploadFilesUnified = async (
  files,
  type = "PROJECT",
  onProgress = null
) => {
  const formData = new FormData();

  // files 배열을 FormData에 추가
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await api.post(
      `/api/v1/files/upload?type=${type}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // 전체 진행률을 각 파일에 분배 (간단하게 첫 번째 파일에만 적용)
            if (files.length > 0) {
              onProgress(0, progress);
            }
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Upload files error:", error);
    throw error;
  }
};

/**
 * 파일명으로 이미지 URL 생성 (정적 리소스 경로 사용)
 * @param {string} fileName - 파일명
 * @returns {string} 이미지 URL
 */
export const getFileUrlByName = async (fileName) => {
  try {
    const response = await api.get(
      `/api/v1/images/view?filename=${fileName}&type=PROJECT`,
      { responseType: "blob" }
    );
    const objectUrl = URL.createObjectURL(response.data);
    return objectUrl;
  } catch (error) {
    console.error("Get file url by name error:", error);
    throw error;
  }
};

/**
 * 원본 이미지 조회
 * @param {string} fileName - 원본 파일명
 * @param {string} type - 파일 타입 (PROJECT, PREPROCESSING, PREPROCESSING_PROCESSED)
 * @returns {string} 이미지 URL
 */
export const getOriginalImageUrl = async (fileName, type = "PROJECT") => {
  try {
    const response = await api.get(
      `/api/v1/images/original/view?filename=${fileName}&type=${type}`,
      { responseType: "blob" }
    );
    const objectUrl = URL.createObjectURL(response.data);
    return objectUrl;
  } catch (error) {
    console.error("Get original image url error:", error);
    throw error;
  }
};
