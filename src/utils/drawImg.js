import { getMaskFromIndexedDB } from "./indexDB";
import { loadImageFromIndexedDB } from "./indexDB";
import { computeCompositeBBoxes } from "./labelUtils";

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // CORS 이슈 방지 (같은 origin이면 없어도 됨)
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);

    img.src = src;
  });
}

export function drawCutoutThumbnail({ canvas, cutout, cutoutCacheRef }) {
  const cached = cutoutCacheRef.current.get(cutout.id);
  if (!cached) return;

  const ctx = canvas.getContext("2d");
  const size = 160;

  // ⚠️ width/height는 최초 1회만 세팅 권장
  if (canvas.width !== size) {
    canvas.width = size;
    canvas.height = size;
  }

  ctx.clearRect(0, 0, size, size);

  const { offCanvas, width, height } = cached;

  // 비율 유지 스케일
  const scale = Math.min(size / width, size / height);
  const drawW = width * scale;
  const drawH = height * scale;

  const offsetX = (size - drawW) / 2;
  const offsetY = (size - drawH) / 2;

  ctx.drawImage(offCanvas, 0, 0, width, height, offsetX, offsetY, drawW, drawH);
}

export function getRotatedAABB(w, h, angle) {
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));

  return {
    width: w * cos + h * sin,
    height: w * sin + h * cos,
  };
}

// 배경 canvas에 컷아웃 그리기
export function drawCutoutOnBackground({
  canvas,
  cutout,
  transform,
  activePlacedId,
  cutoutCacheRef,
}) {
  const cached = cutoutCacheRef.current.get(cutout.sourceId); // 컷아웃 객체 가져오기
  if (!cached) return;

  const ctx = canvas.getContext("2d");
  const { offCanvas } = cached; // 컷아웃 객체
  const { x, y, scale = 1, rotate = 0 } = transform; // 컷아웃 객체 속 변환 정보들

  const imgW = cached.width * scale; // 스케일 적용 크기
  const imgH = cached.height * scale; // 스케일 적용 크기

  const cx = x + imgW / 2; // 컷아웃 중심점 x 좌표
  const cy = y + imgH / 2; // 컷아웃 중심점 y 좌표

  /* =========================
       1️⃣ 이미지 (회전 적용)
    ========================= */
  ctx.save();
  ctx.translate(cx, cy); // 컷아웃 중심점으로 이동
  ctx.rotate(rotate); // 회전
  ctx.drawImage(offCanvas, -imgW / 2, -imgH / 2, imgW, imgH); // 컷아웃 이미지 그리기
  ctx.restore();

  /* =========================
       2️⃣ 마스크(alpha > 0) 기준으로 tight bbox 계산
    ========================= */
  // 현재 이미지(회전 포함)를 임시 캔버스에 그리기 위해 대각선을 기준으로 영역 설정
  const tempCanvas = document.createElement("canvas");
  const diagonal = Math.sqrt(imgW * imgW + imgH * imgH);
  tempCanvas.width = Math.ceil(diagonal) + 20;
  tempCanvas.height = Math.ceil(diagonal) + 20;

  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true }); // 임시 캔버스 컨텍스트
  const tempCx = tempCanvas.width / 2; // 임시 캔버스 중심점 x 좌표
  const tempCy = tempCanvas.height / 2; // 임시 캔버스 중심점 y 좌표

  // 임시 캔버스에 회전된 이미지를 그린다.
  tempCtx.save();
  tempCtx.translate(tempCx, tempCy); // 임시 캔버스 중심점으로 이동
  tempCtx.rotate(rotate); // 회전
  tempCtx.drawImage(offCanvas, -imgW / 2, -imgH / 2, imgW, imgH); // 컷아웃 이미지 그리기
  tempCtx.restore();

  // alpha > 0인 픽셀 기준으로 tight bbox 계산
  const imageData = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );
  const data = imageData.data;

  let minX = tempCanvas.width; // 최소 x 좌표
  let minY = tempCanvas.height; // 최소 y 좌표
  let maxX = -1; // 최대 x 좌표
  let maxY = -1; // 최대 y 좌표

  // 임시 캔버스 속에 이미지데이터를 기준으로 alpha 값이 0보다 큰 픽셀을 찾는다.
  for (let py = 0; py < tempCanvas.height; py++) {
    for (let px = 0; px < tempCanvas.width; px++) {
      const idx = (py * tempCanvas.width + px) * 4;
      const alpha = data[idx + 3];
      if (alpha > 0) {
        if (px < minX) minX = px; // 최소 x 좌표 갱신
        if (py < minY) minY = py; // 최소 y 좌표 갱신
        if (px > maxX) maxX = px; // 최대 x 좌표 갱신
        if (py > maxY) maxY = py; // 최대 y 좌표 갱신
      }
    }
  }

  // tight bbox 계산 (배경 캔버스 좌표계로 변환)
  let boxW, boxH, boxX, boxY;

  if (maxX >= minX && maxY >= minY) {
    // 마스크가 있는 경우: tight bbox
    boxW = maxX - minX + 1;
    boxH = maxY - minY + 1;
    // 임시 캔버스 좌표를 배경 캔버스 좌표로 변환
    const offsetX = minX - tempCx;
    const offsetY = minY - tempCy;
    boxX = cx + offsetX;
    boxY = cy + offsetY;
  } else {
    // 마스크가 없는 경우: 기존 방식 (fallback)
    const aabb = getRotatedAABB(imgW, imgH, rotate);
    boxW = aabb.width;
    boxH = aabb.height;
    boxX = cx - boxW / 2;
    boxY = cy - boxH / 2;
  }

  /* =========================
       3️⃣ UI (마스크 기준 tight bbox 그리기)
    ========================= */
  if (cutout.id === activePlacedId) {
    // 선택 박스 (마스크 기준 tight bbox)
    ctx.strokeStyle = "#f62579";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // 스케일 핸들 (우하단)
    const handleSize = 12;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#f62579";

    ctx.fillRect(
      boxX + boxW - handleSize / 2,
      boxY + boxH - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      boxX + boxW - handleSize / 2,
      boxY + boxH - handleSize / 2,
      handleSize,
      handleSize
    );

    // 회전 핸들 (상단 중앙)
    const rx = boxX + boxW / 2;
    const ry = boxY - 30;

    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();
  }
}

export async function prepareCutout(
  sourceId,
  bbox,
  cutoutCacheRef,
  forceRender
) {
  if (cutoutCacheRef.current.has(sourceId)) return;

  const maskRecord = await getMaskFromIndexedDB(sourceId);
  const imageURL = await loadImageFromIndexedDB(sourceId);
  const img = await loadImage(imageURL);

  const offCanvas = document.createElement("canvas");
  offCanvas.width = bbox.width;
  offCanvas.height = bbox.height;
  const ctx = offCanvas.getContext("2d", { willReadFrequently: true });

  // bbox 영역 draw
  ctx.drawImage(
    img,
    bbox.x,
    bbox.y,
    bbox.width,
    bbox.height,
    0,
    0,
    bbox.width,
    bbox.height
  );

  // mask → alpha 적용
  const imageData = ctx.getImageData(0, 0, bbox.width, bbox.height);
  const data = imageData.data;
  const mask = maskRecord.mask;

  let idx = 0;
  for (let by = 0; by < bbox.height; by++) {
    for (let bx = 0; bx < bbox.width; bx++) {
      if (mask[bbox.y + by][bbox.x + bx] === 0) {
        data[idx * 4 + 3] = 0;
      }
      idx++;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  cutoutCacheRef.current.set(sourceId, {
    offCanvas,
    width: bbox.width,
    height: bbox.height,
  });

  forceRender((prev) => prev + 1);
}

export function flattenComposite({ bgCanvasRef }) {
  const bgCanvas = bgCanvasRef.current;
  const img = document.querySelector(".target-image");
  if (!bgCanvas || !img) return;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = bgCanvas.width;
  outCanvas.height = bgCanvas.height;

  const ctx = outCanvas.getContext("2d");

  // 1️⃣ 배경 이미지 draw
  ctx.drawImage(img, 0, 0, outCanvas.width, outCanvas.height);

  // 2️⃣ 컷아웃 캔버스 draw (이미 합성된 상태)
  ctx.drawImage(bgCanvas, 0, 0);

  return new Promise((resolve) => {
    outCanvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

/**
 * Blob을 base64 문자열로 변환
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result); // data:image/png;base64,... 형식
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportComposite(
  bgCanvasRef,
  placedObjects,
  cutoutCacheRef
) {
  const imageBlob = await flattenComposite({ bgCanvasRef });
  const imageUrl = URL.createObjectURL(imageBlob);
  const image = new Image();
  image.src = imageUrl;
  image.onload = () => {
    console.log(image);
  };

  const canvas = bgCanvasRef.current;

  // 세션 스토리지에서 원본 이미지 크기 가져오기
  const cutoutSources =
    JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
  // 첫 번째 항목의 image 크기를 사용 (또는 배경 이미지에 해당하는 항목)
  // 사용자가 "2번 이미지"라고 했으므로 인덱스 1 사용 (0-based)
  const originalImage = cutoutSources[1]?.image || cutoutSources[0]?.image;
  if (!originalImage || !originalImage.width || !originalImage.height) {
    console.error("원본 이미지 크기를 찾을 수 없습니다.");
    return;
  }

  const labels = computeCompositeBBoxes({
    placedObjects,
    cutoutCacheRef,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    originalImageWidth: originalImage.width,
    originalImageHeight: originalImage.height,
    alphaThreshold: 0,
  });

  // Blob을 base64로 변환하여 세션 스토리지에 저장
  const base64Image = await blobToBase64(imageBlob);

  // 세션 스토리지에 합성 이미지와 라벨 저장 (DataAugmentation 페이지에서 사용)
  sessionStorage.setItem(
    "compositeData",
    JSON.stringify({
      imageBase64: base64Image,
      labels: labels,
      originalImageWidth: originalImage.width,
      originalImageHeight: originalImage.height,
    })
  );

  // 서버 전송 or 파일 저장
  console.log(imageUrl, labels);
}
