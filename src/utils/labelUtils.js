// 합성된 결과(배경 + 컷아웃) 기준으로 mask(alpha)에서 bbox를 계산하는 유틸
// COCO / YOLO 라벨용으로 사용하기 위한 헬퍼 함수

/**
 * placedObjects: SyntheticBackground에서 사용하는 객체 배열
 * cutoutCacheRef: prepareCutout에서 채우는 offCanvas 캐시 (sourceId -> { offCanvas, width, height })
 * canvasWidth / canvasHeight: 배경 캔버스 크기 (bgCanvasRef.current.width / height)
 * originalImageWidth / originalImageHeight: 원본 이미지 크기 (세션 스토리지의 image.width / height)
 *
 * 반환값 예시:
 * [
 *   {
 *     sourceId,
 *     classId,
 *     bbox: { x, y, width, height }, // COCO 스타일 (원본 이미지 픽셀 기준)
 *     yolo: { cx, cy, w, h },       // YOLO 스타일 (0~1 정규화, 원본 이미지 기준)
 *   },
 *   ...
 * ]
 */
export function computeCompositeBBoxes({
  placedObjects,
  cutoutCacheRef,
  canvasWidth,
  canvasHeight,
  originalImageWidth,
  originalImageHeight,
  alphaThreshold = 0,
}) {
  if (!canvasWidth || !canvasHeight) return [];
  if (!originalImageWidth || !originalImageHeight) return [];

  // 화면 크기와 원본 이미지 크기의 비율 계산
  const scaleX = originalImageWidth / canvasWidth;
  const scaleY = originalImageHeight / canvasHeight;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const results = [];

  placedObjects.forEach((obj) => {
    const cached = cutoutCacheRef.current.get(obj.sourceId);
    if (!cached) return;

    const { offCanvas, width, height } = cached;
    if (!offCanvas || !width || !height) return;

    const scale = obj.scale ?? 1;
    const rotate = obj.rotate ?? 0;
    const x = obj.x ?? 0;
    const y = obj.y ?? 0;

    const imgW = width * scale;
    const imgH = height * scale;

    const cx = x + imgW / 2;
    const cy = y + imgH / 2;

    // 1️⃣ 캔버스 초기화
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 2️⃣ 화면과 동일한 방식으로 해당 객체만 그리기
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotate);
    ctx.drawImage(offCanvas, -imgW / 2, -imgH / 2, imgW, imgH);
    ctx.restore();

    // 3️⃣ alpha > threshold 픽셀 기준으로 bbox 계산 (화면 크기 기준)
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;

    let minX = canvasWidth;
    let minY = canvasHeight;
    let maxX = -1;
    let maxY = -1;

    for (let py = 0; py < canvasHeight; py++) {
      for (let px = 0; px < canvasWidth; px++) {
        const idx = (py * canvasWidth + px) * 4;
        const alpha = data[idx + 3];
        if (alpha > alphaThreshold) {
          if (px < minX) minX = px;
          if (py < minY) minY = py;
          if (px > maxX) maxX = px;
          if (py > maxY) maxY = py;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      // 이 객체에 유효한 픽셀이 없으면 스킵
      return;
    }

    // 4️⃣ 화면 크기 기준 bbox를 원본 이미지 크기로 변환
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    const cocoBBox = {
      x: Math.round(minX * scaleX),
      y: Math.round(minY * scaleY),
      width: Math.round(w * scaleX),
      height: Math.round(h * scaleY),
    };

    // 5️⃣ YOLO 정규화는 원본 이미지 크기 기준으로 계산
    const yoloBBox = {
      cx: (cocoBBox.x + cocoBBox.width / 2) / originalImageWidth,
      cy: (cocoBBox.y + cocoBBox.height / 2) / originalImageHeight,
      w: cocoBBox.width / originalImageWidth,
      h: cocoBBox.height / originalImageHeight,
    };

    results.push({
      sourceId: obj.sourceId,
      classId: obj.classId,
      bbox: cocoBBox,
      yolo: yoloBBox,
    });
  });

  return results;
}
