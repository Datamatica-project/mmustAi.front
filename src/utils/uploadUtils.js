import { initChunkUpload, uploadChunk, completeChunkUpload } from "../api/File";

// 청크 크기 (2MB)
const CHUNK_SIZE = 2 * 1024 * 1024;

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

const initFileUpload = async (file) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
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
  return fileId;
};

const uploadFileChunks = async (file, fileId, onProgress = null) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // Upload chunks (순차)
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

  // Complete는 uploadMultipleFiles에서 별도로 호출
  return fileId;
};

export const uploadFile = async (file, onProgress = null) => {
  const fileId = await initFileUpload(file);
  await uploadFileChunks(file, fileId, onProgress);
  // 파일 병합 요청
  await completeChunkUpload(fileId);
  return fileId;
};

export const uploadMultipleFiles = async (files, onFileProgress) => {
  if (files.length === 0) return [];

  const fileIds = [];

  // 각 파일을 순차적으로 처리 (단일 파일 업로드와 동일한 로직)
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];

    try {
      // 각 파일마다: init → 청크 업로드 → complete
      const fileId = await uploadFile(file, (progress) => {
        // 파일별 진행률 콜백
        if (onFileProgress) {
          onFileProgress(fileIndex, progress);
        }
      });

      fileIds[fileIndex] = fileId;
    } catch (error) {
      console.error(`File ${fileIndex} (${file.name}) upload failed:`, error);
      fileIds[fileIndex] = null;
      // 에러가 발생해도 다음 파일 계속 처리
    }
  }

  // 원래 인덱스 순서대로 반환 (null 포함)
  return fileIds;
};

export const createFileChunks = (files, chunkSize) => {
  const file = files[0].file;
  const chunks = [];
  let offset = 0;
  let chunkNumber = 0;

  while (offset < file.size) {
    const end = Math.min(offset + chunkSize, file.size);
    const chunk = file.slice(offset, end); // File.slice()로 청크 생성

    chunks.push({
      number: chunkNumber, // 0부터 시작하는 청크 번호
      data: chunk, // Blob 객체
      size: chunk.size,
      offset: offset,
    });

    offset = end;
    chunkNumber++;
  }

  return chunks;
};
