// UUID 생성 함수 (크로스 브라우저 호환성)
// crypto.randomUUID()가 지원되지 않는 브라우저를 위한 폴백 함수
export function generateUUID() {
  // crypto.randomUUID()가 지원되는 경우 사용 (최신 브라우저)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 폴백: crypto.getRandomValues()를 사용한 UUID v4 생성
  // 대부분의 브라우저에서 지원되는 방식 (더 안전한 랜덤 값 생성)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // UUID v4 형식으로 변환
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  }

  // 최후의 폴백: Math.random() 사용 (보안이 중요하지 않은 경우)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // 0-15 사이의 랜덤 정수
    const v = c === "x" ? r : (r & 0x3) | 0x8; // y는 8, 9, a, b 중 하나
    return v.toString(16); // 16진수로 변환
  });
}
