export function mergeMasks(oldMask, newMask, mode = "Plus") {
  const height = newMask.length;
  const width = newMask[0].length;

  // 기존 마스크가 없을 시
  if (!oldMask) {
    // Minus 모드에서는 빼는 대상이 없으므로 빈 마스크 반환
    if (mode === "Minus") {
      return Array.from({ length: height }, () => Array(width).fill(0));
    }
    // Plus 모드에서는 새 마스크 반환
    return newMask.map((row) => [...row]);
  }

  const result = Array.from({ length: height }, () => Array(width).fill(0));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mode === "Plus") {
        result[y][x] = oldMask[y][x] || newMask[y][x] ? 1 : 0;
      } else if (mode === "Minus") {
        result[y][x] = oldMask[y][x] && !newMask[y][x] ? 1 : 0;
      }
    }
  }

  return result;
}

// 마스크를 캔버스에 그리기
export function drawMaskOnCanvas(
  mask,
  canvas,
  setBbox,
  color = [0, 255, 0, 80],
  borderColor = [0, 255, 0, 255],
  showBBox = true,
  bboxColor = [0, 150, 255, 255], // 빨간색 테두리
  bboxFillColor = [0, 150, 255, 30] // 반투명 빨간색 (alpha: 0.2)
) {
  const ctx = canvas.getContext("2d");
  const height = mask.length;
  const width = mask[0].length;

  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // 경계 픽셀인지 확인하는 함수
  const isBorder = (y, x) => {
    if (mask[y][x] !== 1) return false;

    // 8방향 이웃 확인
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;

      // 경계 밖이거나 마스크 값이 0이면 경계 픽셀
      if (
        ny < 0 ||
        ny >= height ||
        nx < 0 ||
        nx >= width ||
        mask[ny][nx] === 0
      ) {
        return true;
      }
    }

    return false;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (mask[y][x] === 1) {
        // 경계 픽셀이면 테두리 색상 사용
        if (isBorder(y, x)) {
          data[idx] = borderColor[0]; // R
          data[idx + 1] = borderColor[1]; // G
          data[idx + 2] = borderColor[2]; // B
          data[idx + 3] = borderColor[3]; // Alpha
        } else {
          // 내부 픽셀은 반투명 색상
          data[idx] = color[0]; // R
          data[idx + 1] = color[1]; // G
          data[idx + 2] = color[2]; // B
          data[idx + 3] = color[3]; // Alpha
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 바운딩 박스 계산 및 그리기
  if (showBBox) {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    // 마스크 영역에서 바운딩 박스 계산
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y][x] === 1) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 바운딩 박스가 존재하면 그리기
    if (maxX !== -1) {
      const bboxWidth = maxX - minX + 1;
      const bboxHeight = maxY - minY + 1;

      // 바운딩 박스 테두리 그리기
      ctx.strokeStyle = `rgb(${bboxColor[0]}, ${bboxColor[1]}, ${bboxColor[2]})`;
      ctx.lineWidth = 5;
      ctx.strokeRect(minX, minY, bboxWidth, bboxHeight);
    }

    setBbox({
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    });
  }
}
