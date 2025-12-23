import React, { useState, useRef } from "react";
import styled from "styled-components";
import { uploadFilesUnified } from "../../api/File";
import { useToastStore } from "../../store/toastStore";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #202236;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid #2c2e44;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: #b6b5c5;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ffffff;
  }
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.active ? "#f62579" : "#3b3c5d")};
  background-color: ${(props) => (props.active ? "#f62579" : "transparent")};
  color: ${(props) => (props.active ? "#ffffff" : "#b6b5c5")};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #f62579;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${(props) => (props.$dragging ? "#f62579" : "#3b3c5d")};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background-color: ${(props) => (props.$dragging ? "#2a1b2d" : "#151624")};
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 16px;

  &:hover {
    border-color: #f62579;
    background-color: #2a1b2d;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadText = styled.div`
  color: #b6b5c5;
  font-size: 14px;
  margin-top: 10px;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #1c1d2f;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #3b3c5d;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #f62579;
  transition: width 0.3s ease;
  width: ${(props) => props.progress || 0}%;
`;

const FileStatus = styled.span`
  font-size: 11px;
  color: ${(props) => {
    if (props.status === "success") return "#46eb83";
    if (props.status === "error") return "#f62579";
    return "#b6b5c5";
  }};
`;

const RemoveFileButton = styled.button`
  border: none;
  background: transparent;
  color: #f62579;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  margin-left: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background-color: #f62579;
    color: #ffffff;

    &:hover {
      background-color: #d41e66;
    }

    &:disabled {
      background-color: #5b5d75;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background-color: transparent;
    border: 1px solid #5b5d75;
    color: #ffffff;

    &:hover {
      background-color: #3b3c5d;
    }
  }
`;

export default function AddImageModal({
  isOpen,
  onClose,
  projectId,
  onUploadComplete,
}) {
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const [uploadMethod, setUploadMethod] = useState("individual");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map((file) => ({
      file,
      fileId: null,
      progress: 0,
      status: "pending",
    }));
    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  const handleIndividualFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    e.target.value = "";
  };

  const handleZipFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const zipFile = files[0];
      if (!zipFile.name.endsWith(".zip")) {
        useToastStore
          .getState()
          .addToast("Only ZIP files can be uploaded.", "error");
        return;
      }
      handleFileSelect([zipFile]);
    }
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (uploadMethod === "individual") {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        handleFileSelect(files);
      }
    } else {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.name.endsWith(".zip")
      );
      if (files.length > 0) {
        handleFileSelect(files);
      }
    }
  };

  const handleStartUpload = async () => {
    if (uploadFiles.length === 0) {
      useToastStore
        .getState()
        .addToast("업로드할 파일을 선택해주세요.", "error");
      return;
    }

    setIsUploading(true);

    try {
      // 통합 업로드 API 사용 (개별 파일과 ZIP 파일 모두 동일한 방식)
      const files = uploadFiles.map((item) => item.file);

      // 각 파일에 대해 순차적으로 업로드 처리
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];

        try {
          // 진행률 업데이트 (업로드 시작)
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? { ...item, progress: 0, status: "uploading" }
                : item
            )
          );

          // 통합 업로드 API 호출
          const response = await uploadFilesUnified(
            [file],
            "PROJECT",
            (progressFileIndex, progress) => {
              // 진행률 업데이트
              setUploadFiles((prev) =>
                prev.map((item, index) =>
                  index === fileIndex
                    ? { ...item, progress, status: "uploading" }
                    : item
                )
              );
            }
          );

          // 응답에서 fileId 추출 (successFileIds 배열의 첫 번째 요소 사용)
          const fileId =
            response.data?.successFileIds?.[0] ||
            response.data?.fileIds?.[0] ||
            response.data?.fileId ||
            response.fileId;

          // fileId 업데이트 (해당 파일만)
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? {
                    ...item,
                    fileId: fileId,
                    status: "success",
                    progress: 100,
                  }
                : item
            )
          );
        } catch (error) {
          console.error(
            `File ${fileIndex} (${file.name}) upload failed:`,
            error
          );
          // 해당 파일을 에러 상태로 표시
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex ? { ...item, status: "error" } : item
            )
          );
        }
      }

      // 모든 파일 업로드 완료
      const successCount = uploadFiles.filter(
        (item) => item.status === "success"
      ).length;
      if (successCount > 0) {
        useToastStore
          .getState()
          .addToast(`${successCount}개 파일 업로드 완료`, "success");
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      useToastStore
        .getState()
        .addToast("업로드 중 오류가 발생했습니다.", "error");
      setUploadFiles((prev) =>
        prev.map((item) => ({
          ...item,
          status: item.status === "uploading" ? "error" : item.status,
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setUploadFiles([]);
    setIsUploading(false);
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add Images</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        <TabButtons>
          <TabButton
            $active={uploadMethod === "individual"}
            onClick={() => setUploadMethod("individual")}
          >
            개별 파일 선택
          </TabButton>
          <TabButton
            $active={uploadMethod === "zip"}
            onClick={() => setUploadMethod("zip")}
          >
            ZIP 파일 업로드
          </TabButton>
        </TabButtons>

        <UploadArea
          $dragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (uploadMethod === "individual") {
              fileInputRef.current?.click();
            } else {
              zipInputRef.current?.click();
            }
          }}
        >
          <UploadInput
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleIndividualFileChange}
          />
          <UploadInput
            ref={zipInputRef}
            type="file"
            accept=".zip"
            onChange={handleZipFileChange}
          />
          <div
            style={{
              fontSize: "16px",
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            {uploadMethod === "individual"
              ? "📁 이미지 파일을 선택하거나 드래그하세요"
              : "📦 ZIP 파일을 선택하거나 드래그하세요"}
          </div>
          <UploadText>
            {uploadMethod === "individual"
              ? "여러 이미지 파일을 한 번에 선택할 수 있습니다"
              : "압축된 이미지 파일을 업로드합니다"}
          </UploadText>
        </UploadArea>

        {uploadFiles.length > 0 && (
          <>
            <FileList>
              {uploadFiles.map((item, index) => (
                <FileItem key={index}>
                  <FileInfo>
                    <FileName>{item.file.name}</FileName>
                    <ProgressBar>
                      <ProgressFill progress={item.progress} />
                    </ProgressBar>
                    <FileStatus $status={item.status}>
                      {item.status === "pending" && "대기 중"}
                      {item.status === "uploading" &&
                        `업로드 중... ${item.progress}%`}
                      {item.status === "success" && "완료"}
                      {item.status === "error" && "실패"}
                    </FileStatus>
                  </FileInfo>
                  <RemoveFileButton onClick={() => handleRemoveFile(index)}>
                    ✕
                  </RemoveFileButton>
                </FileItem>
              ))}
            </FileList>
            {uploadFiles.some((item) => item.status === "pending") && (
              <Button
                className="primary"
                onClick={handleStartUpload}
                disabled={isUploading}
                style={{ marginTop: "12px", width: "100%" }}
              >
                {isUploading ? "업로드 중..." : "업로드 시작"}
              </Button>
            )}
          </>
        )}

        <ActionButtons>
          <Button className="secondary" onClick={handleClose}>
            취소
          </Button>
        </ActionButtons>
      </ModalContent>
    </ModalOverlay>
  );
}
