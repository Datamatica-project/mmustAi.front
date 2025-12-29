import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import { LeftArrowIcon, RightArrowIcon } from "../components/icons/Icons";
import { sendToTraining } from "../api/augmentation";
import { useToastStore } from "../store/toastStore";
import { augmentImage } from "../utils/opencv/augmentImage";
import { uploadFilesUnified } from "../api/File";
import { usePlacedObjectsStore } from "../store/projectStore";

const Container = styled.div`
  .description {
    margin-top: 10px;
    font-size: 20px;
    color: #b6b5c5;
    font-weight: 400;
  }
`;

const Main = styled.main`
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    font-size: 24px;
    font-weight: 700;
  }
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 20px;
  color: #b6b5c5;
  font-size: 18px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #3a3c55;
    border-top: 4px solid #f62579;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ResultsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ResultCard = styled.div`
  background-color: #2a2b3d;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 2px solid #3a3c55;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #f62579;
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #f62579;
    border-width: 3px;
    background-color: #2a2b3d;
    box-shadow: 0 0 10px rgba(246, 37, 121, 0.3);
  }

  .checkmark {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    background-color: #f62579;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
  }

  .image-container {
    width: 100%;
    min-height: 200px;
    max-height: 300px; // 최대 높이 제한
    border-radius: 8px;
    overflow: hidden;
    background-color: #1a1b2e;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain; // 원본 비율 유지하면서 컨테이너에 맞춤
      display: block; // 이미지 하단 여백 제거
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: #b6b5c5;

    .label-count {
      font-weight: 700;
      color: #ffffff;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;

  button {
    font-size: 16px;
    font-weight: 700;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    padding: 12px 24px;
    gap: 11px;
    border: none;
    cursor: pointer;
    transition-duration: 150ms;

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
      color: #fff;

      &:hover {
        background-color: #3b3c5d;
      }
    }
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #3a3c55;

  button {
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    padding: 5px 12px;
    gap: 11px;
    border: 1px solid #5b5d75;
    color: #fff;
    background-color: transparent;
    cursor: pointer;
    transition-duration: 150ms;

    &:hover {
      background-color: #3b3c5d;
    }
  }
`;

export default function DataAugmentation() {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  // Get projectId from session storage (use useParams if not available)
  const storedProjectId = sessionStorage.getItem("currentProjectId");
  const currentProjectId = projectId || storedProjectId;
  const [loading, setLoading] = useState(true);
  const [augmentedResults, setAugmentedResults] = useState([]);
  const [sending, setSending] = useState(false);
  // Manage selected image IDs (multiple selection)
  const [selectedIds, setSelectedIds] = useState(new Set());
  // Upload state for augmented images
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { imageId: progress }
  // 저장 완료 상태 관리 (학습 데이터 저장 완료 여부)
  const [savedStatus, setSavedStatus] = useState({}); // { imageId: true/false }
  const { placedObjects, setPlacedObjects } = usePlacedObjectsStore();

  useEffect(() => {
    loadAndAugment();
  }, []);

  const loadAndAugment = async () => {
    try {
      setLoading(true); // Set loading state

      // Get composite data from session storage
      const compositeDataStr = sessionStorage.getItem("compositeData");
      // Show error message if composite data not found
      if (!compositeDataStr) {
        useToastStore
          .getState()
          .addToast("Synthetic image data not found.", "error");
        navigate("/synthetic-data/background");
        return;
      }

      // Extract session storage data
      const compositeData = JSON.parse(compositeDataStr);
      const { imageBase64, labels } = compositeData;

      // Convert base64 to Blob
      const response = await fetch(imageBase64);
      const imageBlob = await response.blob();

      // Call OpenCV augmentation API
      const results = await augmentImage(imageBlob, labels);

      // Assign results to processedResults
      let processedResults = results;

      setAugmentedResults(processedResults);
      console.log(processedResults);
      useToastStore
        .getState()
        .addToast(
          `${processedResults.length} augmented images have been created.`,
          "success"
        );
    } catch (error) {
      console.error("Augmentation error:", error);
      useToastStore
        .getState()
        .addToast("An error occurred during augmentation processing.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Image selection/deselection handler
  const handleToggleSelection = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all/deselect all handler
  const handleSelectAll = () => {
    if (selectedIds.size === augmentedResults.length) {
      // Deselect all if all are selected
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(augmentedResults.map((r) => r.id)));
    }
  };

  const handleSendToTraining = async () => {
    // Error if no images selected
    if (selectedIds.size === 0) {
      useToastStore
        .getState()
        .addToast("Please select images to send.", "error");
      return;
    }

    try {
      setSending(true);
      setUploadProgress({});

      // Filter selected images
      const selectedResults = augmentedResults.filter((result) =>
        selectedIds.has(result.id)
      );

      // 각 아이템을 하나씩 처리: 업로드 → fileId 추출 → 저장
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedResults.length; i++) {
        const item = selectedResults[i];
        const resultId = item.id;

        try {
          // 1. Blob을 File로 변환
          let blob = item.imageBlob;
          if (!blob && item.imageUrl) {
            const response = await fetch(item.imageUrl);
            blob = await response.blob();
          }

          const fileName = `augmented-${resultId}-${
            item.augmentationType?.replace(/\s+/g, "-") || "image"
          }.png`;
          const file = new File([blob], fileName, { type: "image/png" });

          // 2. 이미지 업로드 (진행률 업데이트)
          setUploadProgress((prev) => ({
            ...prev,
            [resultId]: 0,
          }));

          const uploadResponse = await uploadFilesUnified(
            [file],
            "PROJECT",
            (progressFileIndex, progress) => {
              // 업로드 진행률 업데이트
              setUploadProgress((prev) => ({
                ...prev,
                [resultId]: progress,
              }));
            }
          );

          // 3. 업로드 결과에서 fileId 추출
          const fileId =
            uploadResponse.data?.successFileIds?.[0] ||
            uploadResponse.data?.fileIds?.[0] ||
            uploadResponse.data?.fileId ||
            uploadResponse.fileId;

          if (!fileId) {
            throw new Error("File ID not found in upload response");
          }

          // 4. 업로드 완료 표시
          setUploadProgress((prev) => ({
            ...prev,
            [resultId]: 100,
          }));

          // 5. cutoutSources에서 각 label의 sourceId에 해당하는 fileId 찾기
          const cutoutSources =
            JSON.parse(sessionStorage.getItem("cutoutSources")) || [];

          // 각 label의 sourceId를 fileId로 매핑
          // item.labels의 각 label은 { sourceId, classId, bbox, yolo } 구조를 가짐
          const labelsWithFileId = item.labels.map((label) => {
            console.log("label", label); // 각 label을 추출
            // label의 sourceId로 cutoutSources에서 원본 메타데이터 찾기
            const sourceMetadata = cutoutSources.find(
              (source) => source.id === label.sourceId
            );

            return {
              ...label,
              // sourceId 필드를 원본 컷아웃의 fileId로 교체
              // (sendToTraining에서 sourceId 필드로 사용됨)
              sourceId: sourceMetadata?.fileId || label.sourceId,
            };
          });

          // 6. fileId와 수정된 labels를 포함한 아이템으로 학습 데이터 전송
          const itemWithFileId = {
            ...item,
            fileId: fileId, // 증강된 이미지의 fileId (증강 이미지 자체의 fileId)
            labels: labelsWithFileId, // 각 label의 sourceId가 원본 컷아웃의 fileId로 매핑됨
          };

          const response = await sendToTraining(projectId, taskId, [
            itemWithFileId,
          ]);
          console.log("response", response);

          // 저장 완료 상태 업데이트 (학습 데이터 저장 성공)
          setSavedStatus((prev) => ({
            ...prev,
            [resultId]: true,
          }));

          successCount++;
        } catch (error) {
          console.error(
            `Failed to process item ${i + 1} (${resultId}):`,
            error
          );
          failCount++;
          // 에러 발생 시 진행률 초기화
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[resultId];
            return newProgress;
          });
        }
      }

      // 결과 메시지 표시
      if (failCount === 0) {
        useToastStore
          .getState()
          .addToast(
            `${successCount} training data items have been successfully sent.`,
            "success"
          );
      } else {
        useToastStore
          .getState()
          .addToast(
            `${successCount} succeeded, ${failCount} failed.`,
            failCount === selectedResults.length ? "error" : "warning"
          );
      }

      // Clear selection after sending
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Training send error:", error);
      useToastStore
        .getState()
        .addToast("An error occurred while sending training data.", "error");
    } finally {
      setSending(false);
      setUploadProgress({});
    }
  };

  const handleBack = () => {
    navigate("/synthetic-data/background");
  };

  // 원본 이미지 다운로드 함수
  const handleDownloadOriginalImage = () => {
    try {
      // 세션 스토리지에서 원본 이미지 가져오기
      const compositeDataStr = sessionStorage.getItem("compositeData");
      if (!compositeDataStr) {
        useToastStore
          .getState()
          .addToast("Original image data not found.", "error");
        return;
      }

      const compositeData = JSON.parse(compositeDataStr);
      const { imageBase64 } = compositeData;

      // base64 데이터를 Blob으로 변환
      // imageBase64가 data URL 형식이면 그대로 사용, 아니면 data URL로 변환
      let base64Data = imageBase64;
      if (!imageBase64.startsWith("data:")) {
        base64Data = `data:image/png;base64,${imageBase64}`;
      }

      // base64를 Blob으로 변환
      const byteCharacters = atob(base64Data.split(",")[1] || base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Blob을 다운로드 링크로 변환하여 다운로드
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `synthetic-original-${Date.now()}.png`; // 파일명에 타임스탬프 추가
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // 메모리 해제

      useToastStore
        .getState()
        .addToast("Original image downloaded successfully.", "success");
    } catch (error) {
      console.error("Download error:", error);
      useToastStore
        .getState()
        .addToast("Failed to download original image.", "error");
    }
  };

  return (
    <Container>
      <div>
        <PageHeader title={"Data Augmentation"} description={"Project_1"} />
        <p className="description">
          Review the augmented images and use them for AI model training.
        </p>
      </div>

      <Main>
        <Header>
          <h3>
            Augmented Images
            {selectedIds.size > 0 && (
              <span
                style={{
                  marginLeft: "15px",
                  fontSize: "16px",
                  color: "#f62579",
                  fontWeight: "normal",
                }}
              >
                ({selectedIds.size} selected)
              </span>
            )}
          </h3>
          {augmentedResults.length > 0 && (
            <button
              className="secondary"
              onClick={handleSelectAll}
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              {selectedIds.size === augmentedResults.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
        </Header>

        {loading ? (
          <LoadingSection>
            <div className="spinner"></div>
            <div>Image augmentation in progress...</div>
          </LoadingSection>
        ) : (
          <ResultsSection>
            {augmentedResults.length === 0 ? (
              <div
                style={{
                  color: "#b6b5c5",
                  textAlign: "center",
                  padding: "60px",
                }}
              >
                No augmented images available.
              </div>
            ) : (
              <>
                <ResultsGrid>
                  {augmentedResults.map((result) => {
                    const isSelected = selectedIds.has(result.id);
                    return (
                      <ResultCard
                        key={result.id}
                        className={isSelected ? "selected" : ""}
                        onClick={() => handleToggleSelection(result.id)}
                      >
                        {isSelected && <div className="checkmark">✓</div>}
                        <div className="image-container">
                          <img
                            src={result.imageUrl}
                            alt={`Augmented ${result.id}`}
                          />
                        </div>
                        <div className="info">
                          <div className="label-count">
                            Number of labels: {result.labels?.length || 0}
                          </div>
                          <div>
                            Augmentation type: {result.augmentationType}
                          </div>
                          {result.fileId && (
                            <div style={{ color: "#2abcf5", fontSize: "12px" }}>
                              ✓ Uploaded (ID: {result.fileId})
                            </div>
                          )}
                          {uploadProgress[result.id] !== undefined &&
                            uploadProgress[result.id] < 100 && (
                              <div
                                style={{ color: "#f62579", fontSize: "12px" }}
                              >
                                Uploading: {uploadProgress[result.id]}%
                              </div>
                            )}
                          {savedStatus[result.id] && (
                            <div
                              style={{
                                color: "#46eb83",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              ✓ Saved to training data
                            </div>
                          )}
                        </div>
                      </ResultCard>
                    );
                  })}
                </ResultsGrid>

                <ActionButtons>
                  <button
                    className="primary"
                    onClick={handleSendToTraining}
                    disabled={sending || selectedIds.size === 0}
                  >
                    {sending
                      ? "Uploading..."
                      : `Upload for AI model training${
                          selectedIds.size > 0
                            ? ` (${selectedIds.size} items)`
                            : ""
                        }`}
                  </button>
                  <button
                    className="secondary"
                    onClick={handleDownloadOriginalImage}
                  >
                    Original Image Download
                  </button>
                  <button className="secondary" onClick={loadAndAugment}>
                    Re-augment
                  </button>
                </ActionButtons>
              </>
            )}
          </ResultsSection>
        )}

        <Navigation>
          <button
            onClick={() =>
              navigate(`/project/${projectId}/synthetic-data/background`)
            }
          >
            {LeftArrowIcon}Prev
          </button>
          <button
            onClick={() => {
              if (currentProjectId) {
                navigate(`/project/${currentProjectId}`);
              } else {
                navigate("/");
              }
            }}
          >
            Return to the project. {RightArrowIcon}
          </button>
        </Navigation>
      </Main>
    </Container>
  );
}
