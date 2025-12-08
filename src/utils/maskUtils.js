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
export function drawMaskOnCanvas(mask, canvas, color = [0, 255, 0, 120]) {
  const ctx = canvas.getContext("2d");
  const height = mask.length;
  const width = mask[0].length;

  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (mask[y][x] === 1) {
        data[idx] = color[0]; // R
        data[idx + 1] = color[1]; // G
        data[idx + 2] = color[2]; // B
        data[idx + 3] = color[3]; // Alpha(0~255)
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
