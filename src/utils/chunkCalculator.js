// 파일 사이즈 기반 청크 계산 유틸리티
export class ChunkUploadCalculator {
  // 권장 청크 크기 상수 (바이트 단위)
  static CHUNK_SIZES = {
    SMALL: 1024 * 1024, // 1MB - 50MB 이하 파일용
    MEDIUM: 2 * 1024 * 1024, // 2MB - 500MB 이하 파일용
    LARGE: 5 * 1024 * 1024, // 5MB - 2GB 이하 파일용
    XLARGE: 10 * 1024 * 1024, // 10MB - 2GB 초과 파일용
  };

  static FILE_SIZE_THRESHOLDS = {
    SMALL: 50 * 1024 * 1024, // 50MB
    MEDIUM: 500 * 1024 * 1024, // 500MB
    LARGE: 2 * 1024 * 1024 * 1024, // 2GB
  };

  /**
   * 파일 사이즈에 따른 최적 청크 설정 계산
   * @param {File} file - 업로드할 파일 객체
   * @returns {Object} 청크 설정 정보
   */
  static calculateOptimalChunks(file) {
    const fileSize = file.size; // 브라우저에서 직접 파일 사이즈 얻기
    const fileName = file.name;

    let chunkSize;
    let description;

    // 파일 사이즈에 따른 청크 크기 결정
    if (fileSize <= this.FILE_SIZE_THRESHOLDS.SMALL) {
      chunkSize = this.CHUNK_SIZES.SMALL;
      description = "소용량 파일 (1MB 청크)";
    } else if (fileSize <= this.FILE_SIZE_THRESHOLDS.MEDIUM) {
      chunkSize = this.CHUNK_SIZES.MEDIUM;
      description = "중용량 파일 (2MB 청크)";
    } else if (fileSize <= this.FILE_SIZE_THRESHOLDS.LARGE) {
      chunkSize = this.CHUNK_SIZES.LARGE;
      description = "대용량 파일 (5MB 청크)";
    } else {
      chunkSize = this.CHUNK_SIZES.XLARGE;
      description = "초대용량 파일 (10MB 청크)";
    }

    const totalChunks = Math.ceil(fileSize / chunkSize);

    return {
      fileName,
      fileSize,
      chunkSize,
      totalChunks,
      description,
      isValidSize: fileSize > 0 && totalChunks <= 1000, // 최대 청크 수 제한
    };
  }

  /**
   * 사용자 친화적인 파일 사이즈 표시
   * @param {number} bytes - 바이트 크기
   * @returns {string} 포맷된 크기 문자열
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
