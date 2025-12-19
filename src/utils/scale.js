import { toLocalCoords } from "./coordinate";
import { updateCanvasCursor } from "./mousecursorUtil";
import { getRotatedAABB } from "./drawImg";

// 스케일 핸들 위에 마우스 커서가 있는지 확인 (마스크 기준 tight bbox 사용)
export function isOnScaleHandle(obj, x, y, cutoutCacheRef) {
  const cached = cutoutCacheRef?.current?.get(obj.sourceId);
  if (!cached) {
    // 캐시가 없으면 fallback
    const w = obj.bbox.width * obj.scale;
    const h = obj.bbox.height * obj.scale;
    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;
    const { width: boxW, height: boxH } = getRotatedAABB(w, h, obj.rotate);
    const handleSize = 12;
    const hx = cx + boxW / 2 - handleSize / 2;
    const hy = cy + boxH / 2 - handleSize / 2;
    return x >= hx && x <= hx + handleSize && y >= hy && y <= hy + handleSize;
  }

  const imgW = cached.width * obj.scale;
  const imgH = cached.height * obj.scale;
  const cx = obj.x + imgW / 2;
  const cy = obj.y + imgH / 2;

  // 회전이 없으면 간단히 처리
  if (obj.rotate === 0) {
    const handleSize = 12;
    const hx = obj.x + imgW - handleSize / 2;
    const hy = obj.y + imgH - handleSize / 2;
    return x >= hx && x <= hx + handleSize && y >= hy && y <= hy + handleSize;
  }

  // 회전이 있으면 마스크 기준 tight bbox 계산 (drawCutoutOnBackground와 동일한 로직)
  const tempCanvas = document.createElement("canvas");
  const diagonal = Math.sqrt(imgW * imgW + imgH * imgH);
  tempCanvas.width = Math.ceil(diagonal) + 20;
  tempCanvas.height = Math.ceil(diagonal) + 20;
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  const tempCx = tempCanvas.width / 2;
  const tempCy = tempCanvas.height / 2;

  tempCtx.save();
  tempCtx.translate(tempCx, tempCy);
  tempCtx.rotate(obj.rotate);
  tempCtx.drawImage(cached.offCanvas, -imgW / 2, -imgH / 2, imgW, imgH);
  tempCtx.restore();

  const imageData = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );
  const data = imageData.data;

  let minX = tempCanvas.width;
  let minY = tempCanvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let py = 0; py < tempCanvas.height; py++) {
    for (let px = 0; px < tempCanvas.width; px++) {
      const idx = (py * tempCanvas.width + px) * 4;
      const alpha = data[idx + 3];
      if (alpha > 0) {
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }
    }
  }

  const handleSize = 12;

  if (maxX >= minX && maxY >= minY) {
    // 마스크 기준 tight bbox의 우하단
    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    const offsetX = minX - tempCx;
    const offsetY = minY - tempCy;
    const boxX = cx + offsetX;
    const boxY = cy + offsetY;

    const hx = boxX + boxW - handleSize / 2;
    const hy = boxY + boxH - handleSize / 2;

    return x >= hx && x <= hx + handleSize && y >= hy && y <= hy + handleSize;
  }

  // 마스크가 없으면 fallback
  const { width: boxW, height: boxH } = getRotatedAABB(imgW, imgH, obj.rotate);
  const hx = cx + boxW / 2 - handleSize / 2;
  const hy = cy + boxH / 2 - handleSize / 2;
  return x >= hx && x <= hx + handleSize && y >= hy && y <= hy + handleSize;
}

export function TransformScale(
  scaleTarget,
  x,
  y,
  canvas,
  setActivePlacedId,
  updateCanvasCursor,
  scaleCenterRef,
  isScalingRef,
  startDistanceRef,
  startScaleRef
) {
  setActivePlacedId(scaleTarget.id);
  updateCanvasCursor(canvas, "nwse-resize");

  scaleCenterRef.current = {
    x: scaleTarget.x + (scaleTarget.bbox.width * scaleTarget.scale) / 2,
    y: scaleTarget.y + (scaleTarget.bbox.height * scaleTarget.scale) / 2,
  };

  isScalingRef.current = true;

  startDistanceRef.current = Math.hypot(
    x - scaleCenterRef.current.x,
    y - scaleCenterRef.current.y
  );
  startScaleRef.current = scaleTarget.scale;
}

export function ScaleMouseMove(
  canvas,
  x,
  y,
  setPlacedObjects,
  activePlacedId,
  startDistanceRef,
  startScaleRef,
  scaleCenterRef
) {
  updateCanvasCursor(canvas, "nwse-resize");
  setPlacedObjects((prev) =>
    prev.map((obj) => {
      if (obj.id !== activePlacedId) return obj;

      const newDistance = Math.hypot(
        x - scaleCenterRef.current.x,
        y - scaleCenterRef.current.y
      );
      const ratio = newDistance / startDistanceRef.current;

      return {
        ...obj,
        scale: Math.max(0.05, startScaleRef.current * ratio),
      };
    })
  );
}
