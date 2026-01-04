import { useBboxStore } from "../store/bboxStore";
import { useToastStore } from "../store/toastStore";
import { saveImageToIndexedDB, saveMaskToIndexedDB } from "./indexDB";
import { generateUUID } from "./generateUUID";
import { uploadFilesUnified } from "../api/File";

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
  // 크로스 브라우저 호환성을 위해 generateUUID() 함수 사용
  const id = generateUUID();

  let sourceId = null;

  try {
    // canvas에서 직접 PNG blob 생성 (타입과 확장자 보장)
    // fetch로 가져온 blob은 type이 비어있을 수 있고, 파일명 추출도 불안정함
    // canvas를 사용하면 확실한 MIME 타입과 확장자를 보장할 수 있음
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // canvas를 PNG blob으로 변환 (확실한 MIME 타입 보장)
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/jpeg", // 명시적으로 PNG 타입 지정
        0.85 // 최고 품질
      );
    });

    // 파일명 생성 (확장자 보장)
    // img.src에서 파일명을 추출하되, 확장자가 없거나 유효하지 않으면 .png 추가
    let fileName = img.src.split("/").pop().split("?")[0];

    // 파일명이 없거나 확장자가 없으면 기본 파일명 사용
    if (!fileName || !fileName.includes(".")) {
      fileName = `cutout-source-${id}.jpeg`;
    } else {
      // 확장자가 있지만 유효한 이미지 확장자가 아닌 경우 .png로 교체
      const ext = fileName.split(".").pop().toLowerCase();
      if (!["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
        fileName = `${nameWithoutExt}.jpeg`;
      }
    }

    // File 객체 생성 (확실한 MIME 타입과 확장자 보장)
    const file = new File([blob], fileName, { type: "image/jpeg" });

    const uploadResponse = await uploadFilesUnified([file], "PROJECT");

    // 업로드 응답에서 fileId 추출 (여러 응답 형태 고려)
    sourceId = uploadResponse.data?.successFileIds?.[0] || null;

    if (!sourceId) {
      console.warn("fileId를 받지 못했습니다. 업로드 응답:", uploadResponse);
      useToastStore.getState().addToast("원본 이미지 업로드 실패", "warning");
    }
  } catch (error) {
    console.error("원본 이미지 서버 업로드 실패:", error);
    useToastStore
      .getState()
      .addToast("원본 이미지 업로드 중 오류 발생", "error");
    // fileId가 없어도 IndexedDB 저장은 계속 진행
  }

  const metadata = {
    id,
    classId: className,
    bbox,
    sourceId: sourceId, // 서버에서 받은 sourceId 추가
    image: {
      width: img.naturalWidth,
      height: img.naturalHeight,
    },
    createdAt: Date.now(),
  };

  // 이전 세션 데이터 가져오기
  const prev = JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
  sessionStorage.setItem("cutoutSources", JSON.stringify([...prev, metadata]));

  // IndexedDB에 원본 이미지 저장 (fetch로 가져온 원본 blob 사용)
  // 업로드용 blob과는 별도로 원본 이미지를 저장하기 위해 다시 fetch
  const originalResponse = await fetch(img.src);
  const originalBlob = await originalResponse.blob();
  await saveImageToIndexedDB(id, originalBlob);
  await saveMaskToIndexedDB(id, fullMask, img.naturalWidth, img.naturalHeight);
}
