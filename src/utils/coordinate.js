// 마우스 좌표 > 캔버스 좌표 변환
export function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// 마우스 좌표를 로컬 좌표계로 변환
export function toLocalCoords(x, y, cx, cy, rotate) {
  const dx = x - cx;
  const dy = y - cy;

  const cos = Math.cos(-rotate);
  const sin = Math.sin(-rotate);

  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos,
  };
}
