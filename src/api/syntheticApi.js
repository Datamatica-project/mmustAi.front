import { opencvApi } from "./axios";
import { api } from "./axios";

export const createSyntheticTask = async (projectId) => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/tasks`, {});
    return response.data;
  } catch (error) {
    console.error("Error creating synthetic task:", error);
    throw error;
  }
};

export const createSyntheticData = async (data) => {
  const { imageUrl, labels } = data;

  // 🔹 blob URL을 실제 Blob/File로 변환
  let imageFile = null;
  if (imageUrl && imageUrl.startsWith("blob:")) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      // PNG 파일로 변환 (이미 PNG면 그대로 사용)
      imageFile = new File([blob], "synthetic-image.png", {
        type: "image/png",
      });
    } catch (error) {
      console.error("Error converting blob URL to file:", error);
      throw error;
    }
  }

  // FormData 생성
  const formData = new FormData();

  // 이미지 파일 추가
  if (imageFile) {
    formData.append("image", imageFile);
  }

  // meta 데이터 생성: bboxes 배열을 포함한 JSON 객체
  const metaData = {
    bboxes: labels.map((label) => ({
      class_id: parseInt(label.classId) || 0,
      bbox: [label.yolo.x, label.yolo.y, label.yolo.w, label.yolo.h],
    })),
    bbox_format: "yolo",
  };

  // meta를 JSON 문자열로 변환 후 Blob으로 만들어서 추가
  const metaJson = JSON.stringify(metaData);
  const metaBlob = new Blob([metaJson], { type: "application/json" });
  formData.append("meta", metaBlob, "meta.json");

  try {
    // FormData를 사용한 POST 요청 (바이너리 이미지 응답 처리)
    const response = await opencvApi.post("/augment", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob", // 바이너리 응답을 Blob으로 받기
    });

    // Blob을 Object URL로 변환하여 이미지로 사용 가능하게 함
    const imageBlob = response.data;
    const imageUrl = URL.createObjectURL(imageBlob);

    return {
      imageBlob, // 원본 Blob (필요시 사용)
      imageUrl, // Object URL (img src에 사용 가능)
    };
  } catch (error) {
    console.error("Error creating synthetic data:", error);
    throw error;
  }
};
