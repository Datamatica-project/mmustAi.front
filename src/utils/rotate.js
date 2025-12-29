import { toLocalCoords } from "./coordinate";
import { getRotatedAABB } from "./drawImg";

// 회전 핸들 위에 마우스 커서가 있는지 확인 (마스크 기준 tight bbox 사용)
export function isOnRotateHandle(obj, x, y, cutoutCacheRef) {
  const cached = cutoutCacheRef?.current?.get(obj.cutoutId || obj.sourceId);
  if (!cached) {
    // 캐시가 없으면 fallback
    const w = obj.bbox.width * obj.scale;
    const h = obj.bbox.height * obj.scale;
    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;
    const { width: boxW, height: boxH } = getRotatedAABB(w, h, obj.rotate);
    const rx = cx;
    const ry = cy - boxH / 2 - 30;
    return Math.hypot(x - rx, y - ry) <= 8;
  }

  const imgW = cached.width * obj.scale;
  const imgH = cached.height * obj.scale;
  const cx = obj.x + imgW / 2;
  const cy = obj.y + imgH / 2;

  // 회전이 없으면 간단히 처리
  if (obj.rotate === 0) {
    const rx = obj.x + imgW / 2;
    const ry = obj.y - 30;
    return Math.hypot(x - rx, y - ry) <= 8;
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

  if (maxX >= minX && maxY >= minY) {
    // 마스크 기준 tight bbox의 상단 중앙
    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    const offsetX = minX - tempCx;
    const offsetY = minY - tempCy;
    const boxX = cx + offsetX;
    const boxY = cy + offsetY;

    const rx = boxX + boxW / 2; // tight bbox의 상단 중앙
    const ry = boxY - 30;

    return Math.hypot(x - rx, y - ry) <= 8;
  }

  // 마스크가 없으면 fallback
  const { width: boxW, height: boxH } = getRotatedAABB(imgW, imgH, obj.rotate);
  const rx = cx;
  const ry = cy - boxH / 2 - 30;
  return Math.hypot(x - rx, y - ry) <= 8;
}

export function TransformRotate(
  rotateTarget,
  x,
  y,
  canvas,
  setActivePlacedId,
  isRotatingRef,
  startAngleRef,
  startRotateRef
) {
  setActivePlacedId(rotateTarget.id);
  isRotatingRef.current = true;

  const w = rotateTarget.bbox.width * rotateTarget.scale;
  const h = rotateTarget.bbox.height * rotateTarget.scale;
  const cx = rotateTarget.x + w / 2;
  const cy = rotateTarget.y + h / 2;

  startAngleRef.current = Math.atan2(y - cy, x - cx);
  startRotateRef.current = rotateTarget.rotate;
}

export function RotateMouseMove(
  canvas,
  x,
  y,
  setPlacedObjects,
  activePlacedId,
  startAngleRef,
  startRotateRef
) {
  setPlacedObjects((prev) =>
    prev.map((obj) => {
      if (obj.id !== activePlacedId) return obj;

      const w = obj.bbox.width * obj.scale;
      const h = obj.bbox.height * obj.scale;
      const cx = obj.x + w / 2;
      const cy = obj.y + h / 2;

      const angle = Math.atan2(y - cy, x - cx);
      const delta = angle - startAngleRef.current;

      return {
        ...obj,
        rotate: startRotateRef.current + delta,
      };
    })
  );
}

// 회전 핸들 위치 계산
// function getRotateHandlePos(obj) {
//   const w = obj.bbox.width * obj.scale;
//   const h = obj.bbox.height * obj.scale;

//   return {
//     x: obj.x + w / 2,
//     y: obj.y - 30, // ❗ 회전 무시
//   };
// }
