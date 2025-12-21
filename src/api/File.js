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
export const initChunkUpload = async (fileInfo) => {
  try {
    const response = await api.post("/api/v1/files/upload/init", fileInfo);
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
export const uploadChunk = async (
  fileId,
  chunkNumber,
  totalChunks,
  chunkData
) => {
  try {
    const response = await api.post(
      `/api/v1/files/upload/chunk?fileId=${fileId}&chunkNumber=${chunkNumber}&totalChunks=${totalChunks}`,
      { chunk: chunkData }
    );
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
