import { isOnScaleHandle } from "./scale";
import { getRotatedAABB } from "./drawImg";
import { isOnRotateHandle } from "./rotate";

// 마우스 커서 업데이트
export function updateHoverCursor(canvas, x, y, placedObjects, cutoutCacheRef) {
  const target = [...placedObjects]
    .reverse()
    .find((obj) => isInsideObject(obj, x, y, cutoutCacheRef));

  if (!target) {
    canvas.style.cursor = "default";
    return;
  }

  if (isOnScaleHandle(target, x, y, cutoutCacheRef)) {
    canvas.style.cursor = "nwse-resize";
    return;
  }

  canvas.style.cursor = "move";
}

// 캔버스 커서 업데이트
export function updateCanvasCursor(canvas, cursor) {
  if (canvas.style.cursor !== cursor) {
    canvas.style.cursor = cursor;
  }
}

// 객체 내부에 마우스 커서가 있는지 확인 (마스크 기준 tight bbox 사용)
export function isInsideObject(obj, x, y, cutoutCacheRef) {
  const cached = cutoutCacheRef?.current?.get(obj.cutoutId || obj.sourceId);
  if (!cached) {
    // 캐시가 없으면 fallback (기존 방식)
    const w = obj.bbox.width * obj.scale;
    const h = obj.bbox.height * obj.scale;
    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;
    const { width: boxW, height: boxH } = getRotatedAABB(w, h, obj.rotate);
    return (
      x >= cx - boxW / 2 &&
      x <= cx + boxW / 2 &&
      y >= cy - boxH / 2 &&
      y <= cy + boxH / 2
    );
  }

  // 실제 렌더링 크기 사용
  const imgW = cached.width * obj.scale;
  const imgH = cached.height * obj.scale;
  const cx = obj.x + imgW / 2;
  const cy = obj.y + imgH / 2;

  // 회전이 없으면 간단히 처리
  if (obj.rotate === 0) {
    return x >= obj.x && x <= obj.x + imgW && y >= obj.y && y <= obj.y + imgH;
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
    // 마스크 기준 tight bbox
    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    const offsetX = minX - tempCx;
    const offsetY = minY - tempCy;
    const boxX = cx + offsetX;
    const boxY = cy + offsetY;

    return x >= boxX && x <= boxX + boxW && y >= boxY && y <= boxY + boxH;
  }

  // 마스크가 없으면 fallback
  const { width: boxW, height: boxH } = getRotatedAABB(imgW, imgH, obj.rotate);
  return (
    x >= cx - boxW / 2 &&
    x <= cx + boxW / 2 &&
    y >= cy - boxH / 2 &&
    y <= cy + boxH / 2
  );
}
