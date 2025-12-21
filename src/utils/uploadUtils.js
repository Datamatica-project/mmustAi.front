import { initChunkUpload, uploadChunk, completeChunkUpload } from "../api/File";

// 청크 크기 (2MB)
const CHUNK_SIZE = 2 * 1024 * 1024;

/**
 * 파일을 base64로 변환
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // data:image/png;base64, 부분 제거
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 파일을 청크로 분할하여 읽기
 */
const readChunk = (file, chunkIndex, chunkSize) => {
  return new Promise((resolve, reject) => {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(chunk);
  });
};

/**
 * 단일 파일 업로드 (청크 방식)
 * @param {File} file - 업로드할 파일
 * @param {Function} onProgress - 진행률 콜백 (progress) => void
 * @returns {Promise<string>} fileId
 */
export const uploadFile = async (file, onProgress = null) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // 1. Init
  const initResponse = await initChunkUpload({
    filename: file.name,
    fileSize: file.size,
    totalChunks: totalChunks,
    pathType: "PROJECT",
    contentType: file.type || "image/jpeg",
  });

  const fileId = initResponse.data?.fileId || initResponse.fileId;
  if (!fileId) {
    throw new Error("Failed to get fileId from init response");
  }

  // 2. Upload chunks (순차)
  for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
    const chunkData = await readChunk(file, chunkNumber, CHUNK_SIZE);
    const chunkResponse = await uploadChunk(
      fileId,
      chunkNumber,
      totalChunks,
      chunkData
    );

    // 진행률 업데이트
    const progress =
      chunkResponse.data?.progress || chunkResponse.progress || 0;
    if (onProgress) {
      onProgress(progress);
    }
  }

  // 3. Complete
  const completeResponse = await completeChunkUpload(fileId);
  return fileId;
};

/**
 * 여러 파일 업로드 (병렬 처리, 동시 업로드 제한)
 * @param {File[]} files - 업로드할 파일 배열
 * @param {Function} onFileProgress - 파일별 진행률 콜백 (fileIndex, progress) => void
 * @param {number} concurrency - 동시 업로드 파일 수 (기본 5)
 * @returns {Promise<string[]>} fileId 배열
 */
export const uploadMultipleFiles = async (
  files,
  onFileProgress,
  concurrency = 5
) => {
  const fileIds = [];
  const uploadQueue = [...files];

  // 동시 업로드 제한을 위한 세마포어 패턴
  const uploadFileWithIndex = async (file, index) => {
    try {
      const fileId = await uploadFile(file, (progress) => {
        if (onFileProgress) {
          onFileProgress(index, progress);
        }
      });
      return { index, fileId, success: true };
    } catch (error) {
      console.error(`File ${index} upload failed:`, error);
      return { index, fileId: null, success: false, error };
    }
  };

  // 동시 업로드 제한
  const results = [];
  for (let i = 0; i < uploadQueue.length; i += concurrency) {
    const batch = uploadQueue.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((file, batchIndex) => uploadFileWithIndex(file, i + batchIndex))
    );
    results.push(...batchResults);
  }

  // 성공한 파일들의 fileId만 반환
  results.forEach((result) => {
    if (result.success && result.fileId) {
      fileIds[result.index] = result.fileId;
    }
  });

  return fileIds.filter((id) => id != null);
};
