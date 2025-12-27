import { blobToImage, canvasToBlob } from "../image/blobToImage";
import { applyAffineToLabels } from "./transformBBox";

export async function augmentImage(imageBlob, labels) {
  console.log(labels);
  const cv = window.cv;

  if (!cv || !cv.Mat) {
    throw new Error("OpenCV is not loaded");
  }

  // // Blob을 Image로 변환
  const img = await blobToImage(imageBlob);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const src = cv.imread(canvas);
  const results = [];
  const imageWidth = src.cols;

  // 증강 옵션 정의
  const augmentations = [
    { type: "rotate", angle: 10 },
    { type: "rotate", angle: -10 },
    { type: "flip", flipCode: 1 },
    { type: "brightness", value: 30 }, // 밝기 증가
    { type: "brightness", value: -30 }, // 밝기 감소
    { type: "contrast", value: 1.3 }, // 대비 증가
    { type: "contrast", value: 0.7 }, // 대비 감소
    { type: "saturation", value: 1.5 }, // 채도 증가
    { type: "saturation", value: 0.5 }, // 채도 감소
    { type: "hue", value: 20 }, // 색조 변경 (+20)
    { type: "hue", value: -20 }, // 색조 변경 (-20)
    { type: "median_blur", value: 5 }, // 미디안 블러 (커널 크기: 5)
    { type: "median_blur", value: 7 }, // 미디안 블러 (커널 크기: 7)
  ];

  for (let i = 0; i < augmentations.length; i++) {
    const dst = new cv.Mat();
    const aug = augmentations[i];

    let M = null;
    let transformedLabels = labels;

    // 회전 (좌표 변환 필요)
    if (aug.type === "rotate") {
      const center = new cv.Point(src.cols / 2, src.rows / 2);
      M = cv.getRotationMatrix2D(center, aug.angle, 1);
      cv.warpAffine(src, dst, M, new cv.Size(src.cols, src.rows));
      transformedLabels = applyAffineToLabels(labels, M);
      // YOLO 좌표도 bbox 기준으로 재계산 (원본 이미지 크기 기준)
      transformedLabels = transformedLabels.map((label) => {
        const { x, y, width, height } = label.bbox;
        return {
          ...label,
          yolo: {
            x: (x + width / 2) / src.cols, // 중심점 x (정규화)
            y: (y + height / 2) / src.rows, // 중심점 y (정규화)
            w: width / src.cols, // 너비 (정규화)
            h: height / src.rows, // 높이 (정규화)
          },
        };
      });
    }

    // 뒤집기 (좌표 변환 필요)
    if (aug.type === "flip") {
      cv.flip(src, dst, aug.flipCode);
      // flip의 경우 별도 처리 필요
      if (aug.flipCode === 1) {
        // 수평 flip: bbox와 yolo 좌표 모두 변환
        transformedLabels = labels.map((label) => ({
          ...label,
          bbox: {
            ...label.bbox,
            x: imageWidth - (label.bbox.x + label.bbox.width),
          },
          // YOLO 좌표도 수평 flip (x 좌표만 변환)
          yolo: {
            ...label.yolo,
            x: 1 - (label.yolo.x + label.yolo.w),
          },
        }));
      }
      // 다른 flipCode도 필요시 추가 (0: 수직, -1: 수평+수직)
    }

    // 밝기 조절 (좌표 변환 불필요)
    if (aug.type === "brightness") {
      // convertTo: alpha=1 (대비 유지), beta=value (밝기 오프셋)
      src.convertTo(dst, -1, 1, aug.value);
      // 좌표는 그대로 유지 (transformedLabels = labels)
    }

    // 대비 조절 (좌표 변환 불필요)
    if (aug.type === "contrast") {
      // convertTo: alpha=value (대비 계수), beta=0 (밝기 오프셋 없음)
      src.convertTo(dst, -1, aug.value, 0);
      // 좌표는 그대로 유지 (transformedLabels = labels)
    }

    // 채도 조절 (좌표 변환 불필요)
    if (aug.type === "saturation") {
      // HSV 색공간으로 변환하여 S(채도) 채널만 조정
      const hsv = new cv.Mat();
      cv.cvtColor(src, hsv, cv.COLOR_BGR2HSV);
      const channels = new cv.MatVector();
      cv.split(hsv, channels);
      const s = channels.get(1); // S 채널 (채도)
      const sAdjusted = new cv.Mat();
      s.convertTo(sAdjusted, -1, aug.value, 0); // 채도 조정
      channels.set(1, sAdjusted);
      cv.merge(channels, hsv);
      cv.cvtColor(hsv, dst, cv.COLOR_HSV2BGR);
      // 메모리 해제 (MatVector에서 가져온 Mat은 delete하지 않음)
      sAdjusted.delete();
      channels.delete();
      hsv.delete();
      // 좌표는 그대로 유지 (transformedLabels = labels)
    }

    // 색조(Hue) 조절 (좌표 변환 불필요)
    if (aug.type === "hue") {
      // HSV 색공간으로 변환하여 H(색조) 채널만 조정
      const hsv = new cv.Mat();
      cv.cvtColor(src, hsv, cv.COLOR_BGR2HSV);
      const channels = new cv.MatVector();
      cv.split(hsv, channels);
      const h = channels.get(0); // H 채널 (색조, 0~180 범위)
      const hAdjusted = new cv.Mat();
      // 색조 오프셋 추가 (0~180 범위로 순환)
      h.convertTo(hAdjusted, -1, 1, aug.value);
      // 0~180 범위로 클리핑 처리
      const mask = new cv.Mat();
      cv.threshold(hAdjusted, mask, 180, 255, cv.THRESH_BINARY);
      hAdjusted.setTo(new cv.Scalar(0), mask);
      // 음수 값 처리 (180을 더해서 순환)
      const negMask = new cv.Mat();
      cv.threshold(hAdjusted, negMask, 0, 255, cv.THRESH_BINARY_INV);
      hAdjusted.setTo(new cv.Scalar(180), negMask);
      channels.set(0, hAdjusted);
      cv.merge(channels, hsv);
      cv.cvtColor(hsv, dst, cv.COLOR_HSV2BGR);
      // 메모리 해제
      hAdjusted.delete();
      mask.delete();
      negMask.delete();
      channels.delete();
      hsv.delete();
      // 좌표는 그대로 유지 (transformedLabels = labels)
    }

    // 미디안 블러 (좌표 변환 불필요)
    if (aug.type === "median_blur") {
      // 미디안 블러: value는 커널 크기 (홀수, 3~15)
      // 노이즈 제거에 효과적이며, 엣지는 잘 보존됨
      cv.medianBlur(src, dst, aug.value);
      // 좌표는 그대로 유지 (transformedLabels = labels)
    }

    cv.imshow(canvas, dst);
    const blob = await canvasToBlob(canvas);

    // Blob을 Object URL로 변환 (이미지 표시용)
    const imageUrl = URL.createObjectURL(blob);

    results.push({
      id: `aug-${i}`,
      imageBlob: blob,
      imageUrl: imageUrl, // ✅ imageUrl 추가
      labels: transformedLabels,
      augmentation: aug,
      augmentationType: `${aug.type}${
        aug.angle !== undefined
          ? ` ${aug.angle}°`
          : aug.flipCode !== undefined
          ? ` ${
              aug.flipCode === 1
                ? "horizontal"
                : aug.flipCode === 0
                ? "vertical"
                : "both"
            }`
          : aug.value !== undefined
          ? ` ${aug.value > 0 ? "+" : ""}${aug.value}`
          : ""
      }`, // ✅ augmentationType 추가
    });

    dst.delete();
    // ✅ M이 생성된 경우 메모리 해제 (rotate일 때만)
    if (M) {
      M.delete();
    }
  }

  src.delete();
  return results;
}
