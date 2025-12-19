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
