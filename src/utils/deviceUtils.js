/**
 * 디바이스 감지 유틸리티
 */

/**
 * 모바일 디바이스인지 확인
 * @returns {boolean} 모바일이면 true, 데스크탑이면 false
 */
export const isMobileDevice = () => {
  // User Agent 기반 감지
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // 모바일 디바이스 패턴
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  // User Agent로 모바일 감지
  const isMobileByUA = mobilePatterns.some((pattern) =>
    pattern.test(userAgent)
  );

  // 화면 크기 기반 감지 (추가 검증)
  // 일반적으로 모바일은 768px 이하로 간주
  const isMobileBySize = window.innerWidth <= 768;

  // 터치 이벤트 지원 여부 확인 (추가 검증)
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // User Agent 또는 화면 크기로 모바일 판단
  // iPad의 경우 User Agent가 모바일이지만 실제로는 태블릿이므로 화면 크기도 고려
  return isMobileByUA || (isMobileBySize && isTouchDevice);
};

/**
 * 태블릿 디바이스인지 확인
 * @returns {boolean} 태블릿이면 true
 */
export const isTabletDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iPad 감지
  const isIPad =
    /iPad/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Android 태블릿 감지 (일반적으로 768px ~ 1024px)
  const isAndroidTablet =
    /Android/i.test(userAgent) &&
    window.innerWidth >= 768 &&
    window.innerWidth <= 1024;

  return isIPad || isAndroidTablet;
};
