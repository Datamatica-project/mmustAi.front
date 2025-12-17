import { openDB } from "idb";

export const cutoutDB = await openDB("cutout-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("masks")) {
      db.createObjectStore("masks", { keyPath: "id" });
    }
  },
});
// 2D mask → Uint8Array 변환 후 IndexedDB 저장
export async function saveMaskToIndexedDB(id, fullMask, width, height) {
  // 1️⃣ 2D mask → Uint8Array 변환
  const data = new Uint8Array(width * height);
  let idx = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data[idx++] = fullMask[y][x] ? 1 : 0;
    }
  }

  // 2️⃣ IndexedDB 저장
  await cutoutDB.put("masks", {
    id,
    width,
    height,
    data, // Uint8Array 그대로 저장 가능
  });
}

// IndexedDB에서 2D mask → Uint8Array 변환 후 반환
export async function getMaskFromIndexedDB(id) {
  const record = await cutoutDB.get("masks", id);
  if (!record) return null;

  const { width, height, data } = record;

  // Uint8Array → 2D mask 복원
  const mask = [];
  let idx = 0;

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(data[idx++]);
    }
    mask.push(row);
  }

  return { mask, width, height };
}

// 이미지 저장
export async function saveImageToIndexedDB(id, fileOrBlob) {
  await cutoutDB.put("images", {
    id,
    blob: fileOrBlob,
  });
}

// 이미지 로드
export async function loadImageFromIndexedDB(id) {
  const record = await cutoutDB.get("images", id);
  if (!record) return null;

  return URL.createObjectURL(record.blob);
}

// 썸네일 그리기
export async function drawCutoutThumbnail(canvas, cutout) {
  const { id, image, bbox } = cutout; // cutout 정보 가져오기
  const ctx = canvas.getContext("2d"); // 캔버스 컨텍스트 가져오기

  const size = 160; //
  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);

  // 1. mask 로드
  const maskRecord = await getMaskFromIndexedDB(id);
  if (!maskRecord) return;

  const { mask, width: imgW, height: imgH } = maskRecord;

  // IndexedDB에서 이미지 로드
  const imageURL = await loadImageFromIndexedDB(id);
  if (!imageURL) return;

  // 2. 원본 이미지 로드
  const img = new Image();
  img.src = imageURL;

  img.onload = () => {
    // bbox 기준 스케일 계산
    const scale = Math.min(size / bbox.width, size / bbox.height);

    const drawW = bbox.width * scale;
    const drawH = bbox.height * scale;

    const offsetX = (size - drawW) / 2;
    const offsetY = (size - drawH) / 2;

    // 3. offscreen canvas (투명 객체 생성용)
    const offCanvas = document.createElement("canvas");
    offCanvas.width = bbox.width;
    offCanvas.height = bbox.height;

    const offCtx = offCanvas.getContext("2d");

    // 원본 bbox 영역 draw
    offCtx.drawImage(
      img,
      bbox.x,
      bbox.y,
      bbox.width,
      bbox.height,
      0,
      0,
      bbox.width,
      bbox.height
    );

    // 4. mask → alpha 적용
    const imageData = offCtx.getImageData(0, 0, bbox.width, bbox.height);
    const data = imageData.data;

    let idx = 0;
    for (let by = 0; by < bbox.height; by++) {
      for (let bx = 0; bx < bbox.width; bx++) {
        const alphaIndex = idx * 4 + 3;

        const srcY = bbox.y + by;
        const srcX = bbox.x + bx;

        if (mask[srcY][srcX] === 0) {
          data[alphaIndex] = 0;
        }

        idx++;
      }
    }

    offCtx.putImageData(imageData, 0, 0);

    // 5. 최종 썸네일에 draw
    ctx.drawImage(
      offCanvas,
      0,
      0,
      bbox.width,
      bbox.height,
      offsetX,
      offsetY,
      drawW,
      drawH
    );
    URL.revokeObjectURL(imageURL);
  };

  img.onerror = () => {
    URL.revokeObjectURL(imageURL);
  };
}

// 배경 canvas에 컷아웃 그리기
export async function drawCutoutOnBackground({ canvas, cutout, transform }) {
  /*
   * 1. IndexedDB에서 mask 로드
   * 2. IndexedDB에서 원본 이미지 Blob 로드
   * 3. bbox 기준 투명 객체(offscreen canvas) 생성
   * 4. transform 적용 (translate / scale / rotate)
   * 5. 배경 canvas에 draw
   */
  const { sourceId, bbox } = cutout;
  const { x, y, scale = 1, rotate = 0 } = transform;

  const ctx = canvas.getContext("2d");

  // mask 로드
  const maskRecord = await getMaskFromIndexedDB(sourceId);
  if (!maskRecord) return;

  const { mask } = maskRecord;

  // 원본 이미지 로드
  const imageURL = await loadImageFromIndexedDB(sourceId);
  if (!imageURL) return;

  const img = new Image();
  img.src = imageURL;

  img.onload = () => {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = bbox.width;
    offCanvas.height = bbox.height;
    const offCtx = offCanvas.getContext("2d");

    // bbox 영역 draw
    offCtx.drawImage(
      img,
      bbox.x,
      bbox.y,
      bbox.width,
      bbox.height,
      0,
      0,
      bbox.width,
      bbox.height
    );

    // mask → alpha 적용
    const imageData = offCtx.getImageData(0, 0, bbox.width, bbox.height);
    const data = imageData.data;

    let idx = 0;
    for (let by = 0; by < bbox.height; by++) {
      for (let bx = 0; bx < bbox.width; bx++) {
        const alphaIndex = idx * 4 + 3;
        if (mask[bbox.y + by][bbox.x + bx] === 0) {
          data[alphaIndex] = 0;
        }
        idx++;
      }
    }

    offCtx.putImageData(imageData, 0, 0);

    // transform 적용후 draw
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    ctx.drawImage(offCanvas, 0, 0, bbox.width, bbox.height);

    ctx.restore();

    URL.revokeObjectURL(imageURL);
  };

  img.onerror = () => {
    URL.revokeObjectURL(imageURL);
  };
}
