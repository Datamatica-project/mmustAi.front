import React, { useState, useEffect } from "react";
import styled from "styled-components";
// import {
//   startAutoLabeling,
//   getAutoLabelingStatus,
//   getAutoLabelingCycleResult,
//   getProject,
// } from "../../api/Project";
// import { useToastStore } from "../../store/toastStore";

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
  max-width: 900px;
  max-height: 90vh;
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

const ProgressSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #151624;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const LabelText = styled.span`
  font-size: 14px;
  color: #b6b5c5;
  font-weight: 500;
`;

const ProgressValue = styled.span`
  font-size: 14px;
  color: #ffffff;
  font-weight: 700;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background-color: #3b3c5d;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f62579 0%, #d41e66 100%);
  transition: width 0.3s ease;
  width: ${(props) => props.progress || 0}%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
`;

const InfoMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: ${(props) => {
    if (props.type === "warning") return "rgba(244, 195, 126, 0.1)";
    if (props.type === "info") return "rgba(42, 188, 245, 0.1)";
    return "rgba(70, 235, 131, 0.1)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.type === "warning") return "#f4c37e";
      if (props.type === "info") return "#2abcf5";
      return "#46eb83";
    }};
  border-radius: 8px;
  color: ${(props) => {
    if (props.type === "warning") return "#f4c37e";
    if (props.type === "info") return "#2abcf5";
    return "#46eb83";
  }};
  font-size: 13px;
  line-height: 1.5;
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #3a3c55;
  border-top: 4px solid #f62579;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
`;

const PhaseText = styled.div`
  font-size: 14px;
  color: #b6b5c5;
  margin-top: 8px;
`;

const CycleSection = styled.div`
  margin-bottom: 24px;
`;

const CycleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CycleTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
`;

const CycleBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background-color: #f62579;
  color: #ffffff;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
`;

const ResultCard = styled.div`
  padding: 16px;
  background-color: #151624;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
  text-align: center;
`;

const ResultLabel = styled.div`
  font-size: 12px;
  color: #b6b5c5;
  margin-bottom: 8px;
`;

const ResultValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => {
    if (props.type === "pass") return "#46eb83";
    if (props.type === "fail") return "#f62579";
    return "#f4c37e";
  }};
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px 16px;
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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background-color: #151624;
  border-radius: 8px;
`;

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #3b3c5d;
  cursor: pointer;

  &:hover {
    border-color: #f62579;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

export default function AutoLabelingModal({
  isOpen,
  onClose,
  projectId,
  projectData,
  onComplete,
}) {
  const [autoLabelingStatus, setAutoLabelingStatus] = useState("idle"); // idle, locked, running, completed
  const [cycleStatus, setCycleStatus] = useState({
    cycleIndex: null,
    phase: null, // inference, training, done
    result: { pass: 0, fail: 0, miss: 0 },
  });
  const [cycle1Images, setCycle1Images] = useState({
    pass: [],
    fail: [],
    miss: [],
  });
  const [activeTab, setActiveTab] = useState("pass");
  const [manualLabelingProgress, setManualLabelingProgress] = useState(25); // 더미 진행률

  const canStartAutoLabeling = manualLabelingProgress >= 10;

  // 더미 이미지 데이터 (Cycle 1용)
  const dummyImages = {
    pass: [
      { url: "https://via.placeholder.com/150/46eb83/ffffff?text=PASS+1" },
      { url: "https://via.placeholder.com/150/46eb83/ffffff?text=PASS+2" },
      { url: "https://via.placeholder.com/150/46eb83/ffffff?text=PASS+3" },
    ],
    fail: [
      { url: "https://via.placeholder.com/150/f62579/ffffff?text=FAIL+1" },
      { url: "https://via.placeholder.com/150/f62579/ffffff?text=FAIL+2" },
    ],
    miss: [
      { url: "https://via.placeholder.com/150/f4c37e/ffffff?text=MISS+1" },
      { url: "https://via.placeholder.com/150/f4c37e/ffffff?text=MISS+2" },
      { url: "https://via.placeholder.com/150/f4c37e/ffffff?text=MISS+3" },
      { url: "https://via.placeholder.com/150/f4c37e/ffffff?text=MISS+4" },
    ],
  };

  useEffect(() => {
    if (!isOpen) return;
    // 모달이 열릴 때 초기화
    setAutoLabelingStatus("idle");
    setCycleStatus({
      cycleIndex: null,
      phase: null,
      result: { pass: 0, fail: 0, miss: 0 },
    });
    setCycle1Images({ pass: [], fail: [], miss: [] });
    setActiveTab("pass");
  }, [isOpen]);

  const handleStartAutoLabeling = () => {
    if (!canStartAutoLabeling) return;
    setAutoLabelingStatus("running");
    setCycleStatus({
      cycleIndex: 1,
      phase: "inference",
      result: { pass: 0, fail: 0, miss: 0 },
    });
  };

  const handleNextPhase = () => {
    if (autoLabelingStatus !== "running") return;

    const currentPhase = cycleStatus.phase;
    const currentCycle = cycleStatus.cycleIndex;

    if (currentPhase === "inference") {
      // inference -> training
      setCycleStatus((prev) => ({
        ...prev,
        phase: "training",
      }));
    } else if (currentPhase === "training") {
      // training -> done
      setCycleStatus((prev) => ({
        ...prev,
        phase: "done",
        result: {
          pass: currentCycle === 1 ? 15 : 20,
          fail: currentCycle === 1 ? 5 : 3,
          miss: currentCycle === 1 ? 8 : 2,
        },
      }));

      // Cycle 1 완료 시 더미 이미지 로드
      if (currentCycle === 1) {
        setCycle1Images(dummyImages);
      }
    } else if (currentPhase === "done") {
      // done -> 다음 사이클로
      if (currentCycle < 3) {
        setCycleStatus({
          cycleIndex: currentCycle + 1,
          phase: "inference",
          result: { pass: 0, fail: 0, miss: 0 },
        });
        setCycle1Images({ pass: [], fail: [], miss: [] });
        setActiveTab("pass");
      } else {
        // 모든 사이클 완료
        setAutoLabelingStatus("completed");
      }
    }
  };

  const handleClose = () => {
    setAutoLabelingStatus("idle");
    setCycleStatus({
      cycleIndex: null,
      phase: null,
      result: { pass: 0, fail: 0, miss: 0 },
    });
    setCycle1Images({ pass: [], fail: [], miss: [] });
    setActiveTab("pass");
    onClose();
  };

  if (!isOpen) return null;

  // 오토라벨링 상태에 따라 컴포넌트 렌더링
  const renderContent = () => {
    // 초기 상태 (시작 전)
    if (autoLabelingStatus === "idle" || autoLabelingStatus === "locked") {
      return (
        <>
          <ProgressSection>
            <ProgressLabel>
              <LabelText>Manual Labeling Progress</LabelText>
              <ProgressValue>{manualLabelingProgress}%</ProgressValue>
            </ProgressLabel>
            <ProgressBarContainer>
              <ProgressBarFill progress={manualLabelingProgress}>
                {manualLabelingProgress}%
              </ProgressBarFill>
            </ProgressBarContainer>
            {!canStartAutoLabeling && (
              <InfoMessage type="warning">
                At least 10% manual labeling is required to start auto labeling.
                Current progress: {manualLabelingProgress}%
              </InfoMessage>
            )}
            {canStartAutoLabeling && (
              <InfoMessage type="info">
                You can start auto labeling. Minimum 10% manual labeling is
                completed.
              </InfoMessage>
            )}
          </ProgressSection>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              className="primary"
              onClick={handleStartAutoLabeling}
              disabled={!canStartAutoLabeling}
            >
              Start Auto Labeling
            </Button>
          </ActionButtons>
        </>
      );
    }

    // 실행 중
    if (autoLabelingStatus === "running") {
      const phaseText =
        cycleStatus.phase === "inference"
          ? "Inference"
          : cycleStatus.phase === "training"
          ? "Training"
          : "Processing";

      return (
        <>
          <LoadingSection>
            <Spinner />
            <LoadingText>
              Auto Labeling in Progress
              <br />
              Cycle {cycleStatus.cycleIndex || 1} / 3
            </LoadingText>
            <PhaseText>{phaseText}</PhaseText>
          </LoadingSection>

          {cycleStatus.cycleIndex > 1 && (
            <ResultGrid>
              <ResultCard>
                <ResultLabel>PASS</ResultLabel>
                <ResultValue type="pass">
                  {cycleStatus.result.pass || 0}
                </ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>FAIL</ResultLabel>
                <ResultValue type="fail">
                  {cycleStatus.result.fail || 0}
                </ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>MISS</ResultLabel>
                <ResultValue type="miss">
                  {cycleStatus.result.miss || 0}
                </ResultValue>
              </ResultCard>
            </ResultGrid>
          )}

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button className="primary" onClick={handleNextPhase}>
              Next: Cycle 2
            </Button>
          </ActionButtons>
        </>
      );
    }

    // Cycle 1 완료 (이미지 표시)
    if (
      autoLabelingStatus === "running" &&
      cycleStatus.cycleIndex === 1 &&
      cycleStatus.phase === "done"
    ) {
      return (
        <>
          <CycleSection>
            <CycleHeader>
              <CycleTitle>Cycle 1 Result</CycleTitle>
              <CycleBadge>Cycle 1 / 3</CycleBadge>
            </CycleHeader>

            <ResultGrid>
              <ResultCard>
                <ResultLabel>PASS</ResultLabel>
                <ResultValue type="pass">
                  {cycleStatus.result.pass || 0}
                </ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>FAIL</ResultLabel>
                <ResultValue type="fail">
                  {cycleStatus.result.fail || 0}
                </ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>MISS</ResultLabel>
                <ResultValue type="miss">
                  {cycleStatus.result.miss || 0}
                </ResultValue>
              </ResultCard>
            </ResultGrid>

            <InfoMessage type="info">
              These results are for review only. You cannot edit them at this
              stage.
            </InfoMessage>

            <TabButtons>
              <TabButton
                active={activeTab === "pass"}
                onClick={() => setActiveTab("pass")}
              >
                PASS ({cycle1Images.pass?.length || 0})
              </TabButton>
              <TabButton
                active={activeTab === "fail"}
                onClick={() => setActiveTab("fail")}
              >
                FAIL ({cycle1Images.fail?.length || 0})
              </TabButton>
              <TabButton
                active={activeTab === "miss"}
                onClick={() => setActiveTab("miss")}
              >
                MISS ({cycle1Images.miss?.length || 0})
              </TabButton>
            </TabButtons>

            <ImageGrid>
              {(cycle1Images[activeTab] || []).map((image, index) => (
                <ImageItem key={index}>
                  <img src={image.url || image} alt={`${activeTab}-${index}`} />
                </ImageItem>
              ))}
            </ImageGrid>
          </CycleSection>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button className="primary" onClick={handleNextPhase}>
              Next: Cycle 2
            </Button>
          </ActionButtons>
        </>
      );
    }

    // 완료
    if (autoLabelingStatus === "completed") {
      return (
        <>
          <CycleSection>
            <CycleHeader>
              <CycleTitle>Final Result</CycleTitle>
              <CycleBadge>Completed</CycleBadge>
            </CycleHeader>

            <ResultGrid>
              <ResultCard>
                <ResultLabel>PASS</ResultLabel>
                <ResultValue type="pass">
                  {cycleStatus.result.pass || 0}
                </ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>FAIL</ResultLabel>
                <ResultValue type="fail">
                  {cycleStatus.result.fail || 0}
                </ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>MISS</ResultLabel>
                <ResultValue type="miss">
                  {cycleStatus.result.miss || 0}
                </ResultValue>
              </ResultCard>
            </ResultGrid>

            {cycleStatus.result.fail > 0 && (
              <InfoMessage type="warning">
                {cycleStatus.result.fail} images require additional manual
                labeling. Please proceed to manual labeling.
              </InfoMessage>
            )}

            {cycleStatus.result.fail === 0 && (
              <InfoMessage type="success">
                Auto labeling completed successfully. You can proceed to review
                or approve.
              </InfoMessage>
            )}
          </CycleSection>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            {cycleStatus.result.fail > 0 && (
              <Button
                className="primary"
                onClick={() => {
                  // TODO: 수동 라벨링 페이지로 이동
                  if (onComplete) onComplete();
                  handleClose();
                }}
              >
                Go to Manual Labeling
              </Button>
            )}
          </ActionButtons>
        </>
      );
    }

    return null;
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Auto Labeling</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        {renderContent()}
      </ModalContent>
    </ModalOverlay>
  );
}
