import { blobToImage, canvasToBlob } from "../image/blobToImage";
import { loadOpenCV } from "./loadOpenCV";
import { applyAffineToLabels } from "./transformBBox";

export async function augmentImage(imageBlob, labels) {
  const cv = await loadOpenCV();

  // Blob을 Image로 변환
  const img = await blobToImage(imageBlob);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const src = cv.imread(canvas);
  const results = [];
  const imageWidth = src.cols;

  // 예시: 3회 증강
  const augmentations = [
    { type: "rotate", angle: 10 },
    { type: "rotate", angle: -10 },
    { type: "flip", flipCode: 1 },
  ];

  for (let i = 0; i < augmentations.length; i++) {
    const dst = new cv.Mat();
    const aug = augmentations[i];

    let M = null;
    let transformedLabels = labels;

    if (aug.type === "rotate") {
      const center = new cv.Point(src.cols / 2, src.rows / 2);
      M = cv.getRotationMatrix2D(center, aug.angle, 1);
      cv.warpAffine(src, dst, M, new cv.Size(src.cols, src.rows));
      transformedLabels = applyAffineToLabels(labels, M);
    }

    if (aug.type === "flip") {
      cv.flip(src, dst, aug.flipCode);
      // ✅ flip의 경우 별도 처리 필요
      if (aug.flipCode === 1) {
        // 수평 flip
        transformedLabels = labels.map((label) => ({
          ...label,
          bbox: {
            ...label.bbox,
            x: imageWidth - (label.bbox.x + label.bbox.width),
          },
        }));
      }
      // 다른 flipCode도 필요시 추가 (0: 수직, -1: 수평+수직)
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
        aug.angle
          ? ` ${aug.angle}°`
          : aug.flipCode
          ? ` ${
              aug.flipCode === 1
                ? "horizontal"
                : aug.flipCode === 0
                ? "vertical"
                : "both"
            }`
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
