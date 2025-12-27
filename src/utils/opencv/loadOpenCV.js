let cvReadyPromise = null;

export function loadOpenCV() {
  // OpenCV 이미 로드되어 있는지 확인
  if (window.cv && window.cv.Mat) {
    return Promise.resolve(window.cv);
  }

  if (cvReadyPromise) return cvReadyPromise;

  cvReadyPromise = new Promise((resolve, reject) => {
    // js 파일 동적 로드
    const script = document.createElement("script");
    script.src = "/opencv/opencv.js"; // public 경로
    script.async = true; // 비동기 로드

    // 로드 완료 후 실행
    script.onload = () => {
      // OpenCV 초기화 완료 후 실행
      window.cv["onRuntimeInitialized"] = () => {
        resolve(window.cv);
      };
    };

    script.onerror = reject; // 로드 실패 시 실행

    document.body.appendChild(script); // 스크립트 추가
  });

  return cvReadyPromise;
}
