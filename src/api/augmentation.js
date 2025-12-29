import { samApi } from "./axios";
import { api } from "./axios";
/**
 * OpenCV 증강 API 호출
 * @param {Blob} imageBlob - 합성된 이미지 Blob
 * @param {Array} labels - COCO/YOLO 스타일 라벨 배열
 * @returns {Promise} 증강된 이미지들과 라벨들
 *
 * 예상 응답 형식:
 * 1. 배열 형식: [{ imageBase64: string, labels: Array, type: string }, ...]
 * 2. 객체 형식: { images: [base64...], labels: [[...], [...]] }
 * 3. 객체 형식: { results: [{ image: base64, labels: [...] }] }
 */
// export const augmentImage = async (imageBlob, labels) => {
//   try {
//     // Blob을 base64로 변환
//     const base64Image = await blobToBase64(imageBlob);

//     const response = await samApi.post("/augment", {
//       image: base64Image,
//       labels: labels,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Augmentation error:", error);
//     throw error;
//   }
// };

/**
 * Blob을 base64 문자열로 변환
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // data:image/png;base64, 부분 제거하고 순수 base64만 반환
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * AI 모델 학습용 데이터 전송
 * @param {Array} augmentedData - 증강된 이미지와 라벨 데이터 배열
 * @returns {Promise} 전송 결과
 */
export const sendToTraining = async (projectId, taskId, itemArray) => {
  console.log(projectId, taskId, itemArray);
  let item = itemArray[0];
  let labels = item.labels;

  const data = {
    augmentation: {
      type: "rotate",
      angle: item.augmentation === "rotate" ? item.augmentation.value : 0,
    },
    fileId: item.fileId,
    annotations: [],
  };

  for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    data.annotations.push({
      classId: label.classId,
      // label의 sourceId는 이미 DataAugmentation에서 원본 컷아웃의 fileId로 매핑되어 있음
      sourceId: label.sourceId,
      yolo: {
        x: label.yolo.x,
        y: label.yolo.y,
        w: label.yolo.w,
        h: label.yolo.h,
      },
    });
  }

  try {
    const response = await api.post(
      `/api/v1/projects/${projectId}/tasks/${taskId}/synthetic-data`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Training data send error:", error);
    throw error;
  }
};
