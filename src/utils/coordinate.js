// 마우스 좌표 > 캔버스 좌표 변환
// 배경 이미지의 실제 표시 영역을 기준으로 좌표 변환
export function getCanvasPos(e, canvas) {
  // 배경 이미지 요소 가져오기
  const img = document.querySelector(".target-image");
  if (!img) {
    // 이미지가 없으면 기존 방식 사용
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  // 배경 이미지의 실제 표시 영역 (padding 제외)
  const imgRect = img.getBoundingClientRect();

  // 마우스 좌표를 배경 이미지의 실제 영역 기준으로 변환
  const x = e.clientX - imgRect.left;
  const y = e.clientY - imgRect.top;

  return { x, y };
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
