// 점 하나 변환
function applyAffineToPoint(x, y, M) {
  const m = M.data64F || M.data32F;

  return {
    x: m[0] * x + m[1] * y + m[2],
    y: m[3] * x + m[4] * y + m[5],
  };
}

export function applyAffineToLabels(labels, M) {
  if (!M) return labels;

  return labels.map((label) => {
    const { x, y, width, height } = label.bbox;

    // bbox → 4 points
    const points = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];

    // 변환
    const transformed = points.map((p) => applyAffineToPoint(p.x, p.y, M));

    // 다시 bbox로
    const xs = transformed.map((p) => p.x);
    const ys = transformed.map((p) => p.y);

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
      ...label,
      bbox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    };
  });
}

function flipBBoxHorizontal(label, imageWidth) {
  const { x, y, width, height } = label.bbox;

  return {
    ...label,
    bbox: {
      x: imageWidth - (x + width),
      y,
      width,
      height,
    },
  };
}
