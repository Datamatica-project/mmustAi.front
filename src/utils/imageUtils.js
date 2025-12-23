import { useBboxStore } from "../store/bboxStore";
import { useToastStore } from "../store/toastStore";
import { saveImageToIndexedDB, saveMaskToIndexedDB } from "./indexDB";

// 이미지를 base64로 변환
export function imageToBase64(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL("image/png").split(",")[1];
}

export async function handleCutout(fullMask) {
  try {
    if (!fullMask) {
      alert("먼저 대상을 선택해주세요");
      return;
    }

    const img = document.querySelector(".target-image");
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    // canvas 준비
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // 원본 이미지 그리기
    ctx.drawImage(img, 0, 0, width, height);

    // 픽셀 데이터 가져오기
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 마스크 적용 => 마스크 = 0 인 픽셀 투명 처리
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (fullMask[y][x] === 0) {
          data[idx + 3] = 0; // alpha = 0 (투명)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "cutout.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("이미지 자르기 실패:", error);
  }
}

// 이미지 메타데이터 저장
export async function saveMetaData(className, bbox, fullMask) {
  const img = document.querySelector(".target-image");

  if (!img) {
    useToastStore.getState().addToast("Image not found", "error");
    return;
  }

  // 인덱스 DB 키 값으로 쓸 랜덤 ID 생성
  const id = crypto.randomUUID();

  const metadata = {
    id,
    classId: className,
    bbox,
    image: {
      width: img.naturalWidth,
      height: img.naturalHeight,
    },
    createdAt: Date.now(),
  };

  // 이전 세션 데이터 가져오기
  const prev = JSON.parse(sessionStorage.getItem("cutoutSources")) || [];

  // 누적 저장
  sessionStorage.setItem("cutoutSources", JSON.stringify([...prev, metadata]));

  // 이미지 저장
  const response = await fetch(img.src);
  const blob = await response.blob();

  await saveImageToIndexedDB(id, blob);
  await saveMaskToIndexedDB(id, fullMask, img.naturalWidth, img.naturalHeight);
}
