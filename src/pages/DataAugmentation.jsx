import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import { LeftArrowIcon, RightArrowIcon } from "../components/icons/Icons";
import { sendToTraining } from "../api/augmentation";
import { useToastStore } from "../store/toastStore";
import { augmentImage } from "../utils/opencv/augmentImage";

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

  &:hover {
    border-color: #f62579;
    transform: translateY(-2px);
  }

  .image-container {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #1a1b2e;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
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
  const { projectId } = useParams();
  // 세션 스토리지에서 projectId 가져오기 (없으면 useParams 사용)
  const storedProjectId = sessionStorage.getItem("currentProjectId");
  const currentProjectId = projectId || storedProjectId;
  const [loading, setLoading] = useState(true);
  const [augmentedResults, setAugmentedResults] = useState([]);
  const [sending, setSending] = useState(false);

  // useEffect(() => {
  //   loadAndAugment();
  // }, []);

  const loadAndAugment = async () => {
    try {
      setLoading(true); // 로딩 상태 설정

      // 세션 스토리지에서 합성 데이터 가져오기
      const compositeDataStr = sessionStorage.getItem("compositeData");
      // 합성 데이터가 없으면 에러 메시지 표시
      if (!compositeDataStr) {
        useToastStore
          .getState()
          .addToast("Synthetic image data not found.", "error");
        navigate("/synthetic-data/background");
        return;
      }

      // 세션 스토리지 데이터 추출
      const compositeData = JSON.parse(compositeDataStr);
      const { imageBase64, labels } = compositeData;

      // base64를 Blob으로 변환
      const response = await fetch(imageBase64);
      const imageBlob = await response.blob();

      // OpenCV 증강 API 호출
      const results = await augmentImage(imageBlob, labels);

      // ✅ results를 processedResults에 할당
      let processedResults = results;

      setAugmentedResults(processedResults);
      useToastStore
        .getState()
        .addToast(
          `${processedResults.length}개의 증강 이미지가 생성되었습니다.`,
          "success"
        );
    } catch (error) {
      console.error("Augmentation error:", error);
      useToastStore
        .getState()
        .addToast("증강 처리 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToTraining = async () => {
    if (augmentedResults.length === 0) {
      useToastStore.getState().addToast("전송할 데이터가 없습니다.", "error");
      return;
    }

    try {
      setSending(true);

      // 증강된 데이터를 학습용 형식으로 변환
      const trainingData = augmentedResults.map((result) => ({
        image: result.imageUrl,
        labels: result.labels,
      }));

      await sendToTraining(trainingData);

      useToastStore
        .getState()
        .addToast("학습 데이터가 성공적으로 전송되었습니다.", "success");

      // 프로젝트 페이지로 이동
      if (currentProjectId) {
        navigate(`/project/${currentProjectId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Training send error:", error);
      useToastStore
        .getState()
        .addToast("학습 데이터 전송 중 오류가 발생했습니다.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    navigate("/synthetic-data/background");
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
          <h3>Augmented Images</h3>
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
                  {augmentedResults.map((result) => (
                    <ResultCard key={result.id}>
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
                        <div>Augmentation type: {result.augmentationType}</div>
                      </div>
                    </ResultCard>
                  ))}
                </ResultsGrid>

                <ActionButtons>
                  <button
                    className="primary"
                    onClick={handleSendToTraining}
                    disabled={sending}
                  >
                    {sending
                      ? "Uploading..."
                      : "Uploading for AI model training"}
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
          <button onClick={handleBack}>{LeftArrowIcon}Prev</button>
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
