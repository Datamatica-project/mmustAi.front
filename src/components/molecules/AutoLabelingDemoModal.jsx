import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  getAutoLabelingResult,
  getProject,
  getProjectDetail,
  startAutoLabeling,
} from "../../api/Project";
import { useToastStore } from "../../store/toastStore";
import { getOriginalImageUrl } from "../../api/File";
import confetti from "canvas-confetti";
import { CheckIcon } from "../icons/Icons";
import { classes as defaultClasses } from "../../data";

// 기존 AutoLabelingModal과 동일한 스타일 컴포넌트들 재사용
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
  width: ${(props) => props.$progress || 0}%;
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

const StatusCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 48px 32px;
  gap: 24px;
  background: linear-gradient(135deg, #1c1d2f 0%, #2a2b3d 100%);
  border-radius: 16px;
  border: 2px solid ${(props) => (props.$isCompleted ? "#46eb83" : "#f62579")};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 200px;
  width: 100%;
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$isCompleted
      ? "linear-gradient(135deg, #46eb83 0%, #2dd47e 100%)"
      : "linear-gradient(135deg, #f62579 0%, #d41e66 100%)"};
  box-shadow: 0 4px 20px
    ${(props) =>
      props.$isCompleted
        ? "rgba(70, 235, 131, 0.4)"
        : "rgba(246, 37, 121, 0.4)"};
  position: relative;

  svg {
    width: 100%;
    height: 100%;
  }

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${(props) =>
      props.$isCompleted
        ? "linear-gradient(135deg, #46eb83 0%, #2dd47e 100%)"
        : "linear-gradient(135deg, #f62579 0%, #d41e66 100%)"};
    opacity: 0.3;
    animation: ${(props) =>
      props.$isCompleted ? "pulse 2s ease-in-out infinite" : "none"};
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;

const StatusTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0;
  letter-spacing: -0.5px;
`;

const StatusDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #b6b5c5;
  text-align: center;
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: ${(props) =>
    props.$isCompleted ? "rgba(70, 235, 131, 0.1)" : "rgba(246, 37, 121, 0.1)"};
  border: 1px solid ${(props) => (props.$isCompleted ? "#46eb83" : "#f62579")};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.$isCompleted ? "#46eb83" : "#f62579")};
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
  grid-template-columns: repeat(2, 1fr);
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

  &.danger {
    background-color: transparent;
    border: 1px solid #f62579;
    color: #f62579;

    &:hover {
      background-color: rgba(246, 37, 121, 0.1);
    }
  }
`;

// 루프 완료 화면용 스타일
const LoopCompleteSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #151624;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
`;

const LoopCompleteTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 16px;
`;

const AutoLoopCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: #1c1d2f;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f62579;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #b6b5c5;
  cursor: pointer;
  user-select: none;
`;

const LoopProgressInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(42, 188, 245, 0.1);
  border: 1px solid #2abcf5;
  border-radius: 8px;
  color: #2abcf5;
  font-size: 13px;
  text-align: center;
`;

// 최종 결과 화면용 스타일 (기존 AutoLabelingModal과 동일)
const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$active ? "#f62579" : "#3b3c5d")};
  background-color: ${(props) => (props.$active ? "#f62579" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#b6b5c5")};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #f62579;
  }
`;

const FileListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background-color: #151624;
  border-radius: 8px;
`;

const FileListItem = styled.div`
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #1c1d2f;
  border-radius: 6px;
  border: 1px solid #3b3c5d;
  cursor: pointer;
  transition: all 0.2s;
  color: #ffffff;
  font-size: 13px;

  &:hover {
    border-color: #f62579;
    background-color: #2a2b3d;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ImageModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ImageModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImageModalImage = styled.img`
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
`;

const ImageModalClose = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #f62579;
  }
`;

const ImageModalFileName = styled.div`
  margin-top: 16px;
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  word-break: break-all;
`;

const ImageNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    border-color: #f62579;
    color: #f62579;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &.prev {
    left: 20px;
  }

  &.next {
    right: 20px;
  }
`;

export default function AutoLabelingDemoModal({
  isOpen,
  onClose,
  projectId,
  projectData,
  onComplete,
}) {
  // 최대 루프 횟수 (변수로 관리 가능)
  const MAX_LOOP_COUNT = 4;

  const [autoLabelingStatus, setAutoLabelingStatus] = useState("idle"); // idle, running, loopComplete, finalComplete, showingResults
  const [manualLabelingProgress, setManualLabelingProgress] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(0); // 현재 루프 번호 (1부터 시작)
  const [loopResults, setLoopResults] = useState([]); // 각 루프의 결과 저장 [{ loop: 1, passed: 10, failed: 2 }, ...]
  const [currentLoopResult, setCurrentLoopResult] = useState({
    passed: 0,
    failed: 0,
  }); // 현재 루프의 결과
  const [finalResult, setFinalResult] = useState({
    passed: 0,
    failed: 0,
  }); // 최종 결과 (최초 루프에서 받은 값)
  const [isAutoLoop, setIsAutoLoop] = useState(false); // 자동 루프 진행 여부
  const [isLoopRunning, setIsLoopRunning] = useState(false); // 루프 진행 중 여부 (자동 진행 시)
  const [resultImages, setResultImages] = useState([]); // 최종 결과 이미지 리스트 (pass)
  const [failedImages, setFailedImages] = useState([]); // 최종 결과 이미지 리스트 (fail)
  const [firstLoopPassedImages, setFirstLoopPassedImages] = useState([]); // 최초 루프에서 pass된 이미지 리스트
  const [activeTab, setActiveTab] = useState("pass"); // pass/fail 탭 전환
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 (원본 이미지 URL)
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1); // 선택된 이미지의 인덱스
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 이미지 모달 열림 상태
  const [isFirstLoopImageList, setIsFirstLoopImageList] = useState(false); // 최초 루프 이미지 리스트 여부

  const canStartAutoLabeling = manualLabelingProgress >= 10;

  // 이미지 URL 정리
  useEffect(() => {
    return () => {
      if (selectedImage?.url) {
        URL.revokeObjectURL(selectedImage.url);
      }
    };
  }, [selectedImage]);

  // Confetti 효과 (최종 완료 시)
  useEffect(() => {
    if (autoLabelingStatus === "finalComplete") {
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 2000,
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [autoLabelingStatus]);

  useEffect(() => {
    if (!isOpen) return;

    // 모달이 열릴 때 초기화
    setAutoLabelingStatus("idle");
    setCurrentLoop(0);
    setLoopResults([]);
    setCurrentLoopResult({ passed: 0, failed: 0 });
    setIsAutoLoop(false);
    setIsLoopRunning(false);
    setResultImages([]);
    setFailedImages([]);
    setActiveTab("pass");
    setSelectedImage(null);
    setIsImageModalOpen(false);

    // 진행률 계산
    const fetchAutoLabelingStatus = async () => {
      const response = await getProject(projectId);
      const percentage =
        response.data.totalJobCount > 0
          ? (response.data.approvedJobCount / response.data.totalJobCount) * 100
          : 0;
      //   setManualLabelingProgress(percentage);
      setManualLabelingProgress(10);
    };

    fetchAutoLabelingStatus();
  }, [isOpen, projectId]);

  // 최종 결과 보기 함수 (useCallback으로 감싸서 의존성 문제 해결)
  const handleViewFinalResults = useCallback(async () => {
    try {
      const result = await getAutoLabelingResult(projectId);
      let passdImages = [];
      let failedImages = [];

      if (result && result.items && Array.isArray(result.items)) {
        const resultItems = result.items;

        // resultPath 파싱 함수
        const parseResultPath = (resultPath) => {
          if (!resultPath) return null;

          const resultIndex = resultPath.indexOf("/result/");
          if (resultIndex === -1) return null;

          const afterResult = resultPath.substring(
            resultIndex + "/result/".length
          );
          const parts = afterResult.split("/");
          const which = parts[0];
          const name = parts[parts.length - 1];

          const runIdMatch = resultPath.match(/run_\d{8}_\d{6}_[a-f0-9]+/);
          const runId = runIdMatch ? runIdMatch[0] : null;

          if (!runId || !name || !which) return null;

          return {
            runId,
            name,
            which,
            fileName: name,
          };
        };

        passdImages = resultItems
          .filter((item) => item.passed === true)
          .map((item) => parseResultPath(item.resultPath))
          .filter((item) => item !== null);

        failedImages = resultItems
          .filter((item) => item.passed === false)
          .map((item) => parseResultPath(item.resultPath))
          .filter((item) => item !== null);

        setResultImages(passdImages);
        setFailedImages(failedImages);
        setAutoLabelingStatus("showingResults");
      } else {
        useToastStore
          .getState()
          .addToast("결과를 불러올 수 없습니다.", "error");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      useToastStore
        .getState()
        .addToast("결과 조회 중 오류가 발생했습니다.", "error");
    }
  }, []);

  // 오토라벨링 시작 (첫 번째 루프 또는 다음 루프) - useCallback으로 감싸서 의존성 문제 해결
  // handleStartAutoLabeling을 useEffect보다 위에 정의하여 초기화 오류 방지
  const handleStartAutoLabeling = useCallback(async () => {
    setAutoLabelingStatus("running");
    setIsLoopRunning(true);

    try {
      const response = await startAutoLabeling(null, projectId);

      // 결과 확인
      const result = await getAutoLabelingResult(projectId);

      // 루프 번호 증가
      const newLoop = currentLoop + 1;

      // 최초 루프(1회차)에서는 최종 결과를 저장하고 시뮬레이션 시작점 계산
      let finalPassed, finalFailed;
      if (newLoop === 1) {
        // 최초 루프에서 최종 결과를 받아서 저장
        finalPassed = result.passedCount || 0;
        finalFailed = result.failedCount || 0;
        setFinalResult({ passed: finalPassed, failed: finalFailed });

        // 최초 루프에서 passed된 항목들의 resultPath를 랜덤으로 추출하여 저장
        if (result && result.items && Array.isArray(result.items)) {
          const parseResultPath = (resultPath) => {
            if (!resultPath) return null;

            const resultIndex = resultPath.indexOf("/result/");
            if (resultIndex === -1) return null;

            const afterResult = resultPath.substring(
              resultIndex + "/result/".length
            );
            const parts = afterResult.split("/");
            const which = parts[0];
            const name = parts[parts.length - 1];

            const runIdMatch = resultPath.match(/run_\d{8}_\d{6}_[a-f0-9]+/);
            const runId = runIdMatch ? runIdMatch[0] : null;

            if (!runId || !name || !which) return null;

            return {
              runId,
              name,
              which,
              fileName: name,
            };
          };

          // passed === true인 항목들 필터링 및 파싱
          const passedItems = result.items
            .filter((item) => item.passed === true)
            .map((item) => parseResultPath(item.resultPath))
            .filter((item) => item !== null);

          // 랜덤으로 섞기 (Fisher-Yates 셔플 알고리즘)
          const shuffled = [...passedItems];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          // 40개만 선택하여 저장 (초기 결과는 40개로 표시)
          const displayCount = 40;
          const selectedImages = shuffled.slice(
            0,
            Math.min(displayCount, shuffled.length)
          );
          setFirstLoopPassedImages(selectedImages);
        }
      } else {
        // 2회차 이후에는 저장된 최종 결과 사용
        finalPassed = finalResult.passed;
        finalFailed = finalResult.failed;
      }

      // 각 루프마다 시뮬레이션된 결과 계산
      // 최종 결과를 기준으로 fail에서 pass로 점진적으로 이동하는 효과
      let simulatedPassed, simulatedFailed;
      const total = finalPassed + finalFailed;

      if (newLoop === 1) {
        // 최초 루프: 초기 결과는 40개로 표시 (점진적 개선을 보여주기 위해)
        simulatedPassed = 40;
        simulatedFailed = total - 40;
      } else {
        // 2~4회차: 점진적으로 fail에서 pass로 이동
        // 진행률 계산 (0.0 ~ 1.0)
        // newLoop가 2일 때: progress = 1/3 = 0.33
        // newLoop가 3일 때: progress = 2/3 = 0.67
        // newLoop가 4일 때: progress = 3/3 = 1.0
        const progress = (newLoop - 1) / (MAX_LOOP_COUNT - 1);

        // 최초 값 (fail이 많고 pass가 적음) - 1회차에서 사용한 값 (40개)
        const initialPassed = 40;
        const initialFailed = total - initialPassed;

        // 선형 보간으로 점진적 변화
        // progress가 0일 때: initial 값 (1회차)
        // progress가 1일 때: final 값 (4회차)
        simulatedFailed = Math.round(
          initialFailed + (finalFailed - initialFailed) * progress
        );
        simulatedPassed = total - simulatedFailed;
      }

      // 현재 루프 결과 저장
      setCurrentLoopResult({
        passed: simulatedPassed,
        failed: simulatedFailed,
      });

      // 루프 번호 업데이트
      setCurrentLoop(newLoop);

      // 루프 결과 저장
      setLoopResults((prev) => [
        ...prev,
        { loop: newLoop, passed: simulatedPassed, failed: simulatedFailed },
      ]);

      // 루프 완료 상태로 변경
      setAutoLabelingStatus("loopComplete");

      // 자동 루프가 활성화되어 있고 최대 횟수에 도달했으면 최종 완료 처리
      // (useEffect에서 자동으로 다음 루프 진행하거나 최종 완료 처리)
      if (isAutoLoop && newLoop >= MAX_LOOP_COUNT) {
        setIsLoopRunning(false);
        // useEffect에서 handleViewFinalResults 호출됨
      }
    } catch (error) {
      console.error("Auto labeling error:", error);
      useToastStore
        .getState()
        .addToast("오토라벨링 실행 중 오류가 발생했습니다.", "error");
      setAutoLabelingStatus("idle");
      setIsLoopRunning(false);
    }
  }, [
    projectId,
    currentLoop,
    isAutoLoop,
    MAX_LOOP_COUNT,
    handleViewFinalResults,
    finalResult,
  ]);

  // 자동 루프 진행 처리 (handleStartAutoLabeling과 handleViewFinalResults가 정의된 후에 실행)
  useEffect(() => {
    if (
      isAutoLoop &&
      isLoopRunning &&
      autoLabelingStatus === "loopComplete" &&
      currentLoop < MAX_LOOP_COUNT
    ) {
      // 자동으로 다음 루프 진행
      const timer = setTimeout(() => {
        // 다음 루프 시작
        handleStartAutoLabeling();
      }, 2000); // 2초 후 자동 진행

      return () => clearTimeout(timer);
    } else if (
      isAutoLoop &&
      currentLoop >= MAX_LOOP_COUNT &&
      autoLabelingStatus === "loopComplete"
    ) {
      // 최대 루프 횟수 도달 시 최종 완료 처리
      setIsLoopRunning(false);
      handleViewFinalResults();
    }
  }, [
    isAutoLoop,
    isLoopRunning,
    autoLabelingStatus,
    currentLoop,
    MAX_LOOP_COUNT,
    handleStartAutoLabeling,
    handleViewFinalResults,
  ]);

  // 다음 루프 진행 (수동 진행 시 사용)
  // 체크박스가 활성화되어 있으면 자동 루프 모드로 전환
  const handleNextLoop = async () => {
    if (currentLoop >= MAX_LOOP_COUNT) {
      // 최대 루프 횟수 도달
      handleViewFinalResults();
      return;
    }

    // 체크박스가 활성화되어 있으면 자동 루프 모드로 전환
    if (isAutoLoop) {
      setIsLoopRunning(true);
    }

    // 다음 루프 시작
    await handleStartAutoLabeling();
  };

  // 루프 중단
  const handleStopLoop = () => {
    setIsLoopRunning(false);
    setIsAutoLoop(false);
    useToastStore.getState().addToast("루프가 중단되었습니다.", "info");
  };

  const handleClose = () => {
    setAutoLabelingStatus("idle");
    setCurrentLoop(0);
    setLoopResults([]);
    setCurrentLoopResult({ passed: 0, failed: 0 });
    setFinalResult({ passed: 0, failed: 0 }); // 최종 결과도 초기화
    setIsAutoLoop(false);
    setIsLoopRunning(false);
    setResultImages([]);
    setFailedImages([]);
    setFirstLoopPassedImages([]); // 최초 루프 이미지 리스트 초기화
    setActiveTab("pass");
    setSelectedImage(null);
    setIsImageModalOpen(false);
    setIsFirstLoopImageList(false); // 최초 루프 이미지 리스트 상태 초기화
    onClose();
  };

  const handleCloseImageModal = () => {
    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url);
    }
    setSelectedImage(null);
    setSelectedImageIndex(-1);
    setIsImageModalOpen(false);
    setIsFirstLoopImageList(false); // 모달 닫을 때 최초 루프 이미지 리스트 상태 초기화
  };

  const handleFileNameClick = useCallback(async (imageData, index) => {
    try {
      const imageUrl = await getOriginalImageUrl(
        imageData.runId,
        imageData.name,
        imageData.which
      );
      setSelectedImage({ url: imageUrl, fileName: imageData.fileName });
      setSelectedImageIndex(index);
      setIsImageModalOpen(true);
    } catch (error) {
      console.error("Error loading original image:", error);
      useToastStore
        .getState()
        .addToast("이미지를 불러올 수 없습니다.", "error");
    }
  }, []);

  const handleNextImage = useCallback(async () => {
    // 최초 루프 이미지 리스트인 경우 firstLoopPassedImages 사용
    const currentList = isFirstLoopImageList
      ? firstLoopPassedImages
      : activeTab === "pass"
      ? resultImages
      : failedImages;
    if (selectedImageIndex < currentList.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      const nextImageData = currentList[nextIndex];
      await handleFileNameClick(nextImageData, nextIndex);
    }
  }, [
    isFirstLoopImageList,
    firstLoopPassedImages,
    activeTab,
    resultImages,
    failedImages,
    selectedImageIndex,
    handleFileNameClick,
  ]);

  const handlePrevImage = useCallback(async () => {
    if (selectedImageIndex > 0) {
      // 최초 루프 이미지 리스트인 경우 firstLoopPassedImages 사용
      const currentList = isFirstLoopImageList
        ? firstLoopPassedImages
        : activeTab === "pass"
        ? resultImages
        : failedImages;
      const prevIndex = selectedImageIndex - 1;
      const prevImageData = currentList[prevIndex];
      await handleFileNameClick(prevImageData, prevIndex);
    }
  }, [
    isFirstLoopImageList,
    firstLoopPassedImages,
    activeTab,
    resultImages,
    failedImages,
    selectedImageIndex,
    handleFileNameClick,
  ]);

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!isImageModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextImage();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCloseImageModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isImageModalOpen,
    handlePrevImage,
    handleNextImage,
    handleCloseImageModal,
  ]);

  if (!isOpen) return null;

  // 오토라벨링 상태에 따라 컴포넌트 렌더링
  const renderContent = () => {
    // 초기 상태 (시작 전)
    if (autoLabelingStatus === "idle") {
      return (
        <>
          <ProgressSection>
            <ProgressLabel>
              <LabelText>Manual Labeling Progress</LabelText>
              <ProgressValue>
                {Math.round(manualLabelingProgress)}%
              </ProgressValue>
            </ProgressLabel>
            <ProgressBarContainer>
              <ProgressBarFill $progress={Math.round(manualLabelingProgress)}>
                {Math.round(manualLabelingProgress)}%
              </ProgressBarFill>
            </ProgressBarContainer>
            {!canStartAutoLabeling && (
              <InfoMessage type="warning">
                At least 10% manual labeling is required to start auto labeling.
                Current progress: {Math.round(manualLabelingProgress)}%
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
              //   disabled={!canStartAutoLabeling}
            >
              Start Auto Labeling
            </Button>
          </ActionButtons>
        </>
      );
    }

    // 실행 중 (로딩)
    if (autoLabelingStatus === "running") {
      return (
        <>
          <StatusCard $isCompleted={false}>
            <StatusIcon $isCompleted={false}>
              <Spinner />
            </StatusIcon>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <StatusTitle>Auto Labeling in Progress</StatusTitle>
              <StatusDescription>
                {currentLoop > 0
                  ? `Loop ${currentLoop + 1} is being processed.`
                  : "Our AI is analyzing and labeling your images. This may take a few moments."}
                <br />
                Please do not close this window.
              </StatusDescription>
              <StatusBadge $isCompleted={false}>
                <span>Processing...</span>
              </StatusBadge>
            </div>
          </StatusCard>
        </>
      );
    }

    // 루프 완료 상태
    if (autoLabelingStatus === "loopComplete") {
      const passCount = currentLoopResult.passed;
      const failCount = currentLoopResult.failed;

      return (
        <>
          <StatusCard $isCompleted={true}>
            <StatusIcon $isCompleted={true}>{CheckIcon}</StatusIcon>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <StatusTitle>Loop {currentLoop} Completed!</StatusTitle>
              <StatusDescription>
                Loop {currentLoop} has been successfully processed.
              </StatusDescription>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                <StatusBadge $isCompleted={true}>
                  <span>✓ Pass: {passCount}</span>
                </StatusBadge>
                <StatusBadge
                  $isCompleted={false}
                  style={{
                    backgroundColor: "#f44336",
                    color: "#ffffff",
                  }}
                >
                  <span>✗ Fail: {failCount}</span>
                </StatusBadge>
              </div>
            </div>
          </StatusCard>

          <LoopCompleteSection>
            {/* 루프 진행 정보 */}
            {isAutoLoop && isLoopRunning && (
              <LoopProgressInfo>
                Auto loop is running... ({currentLoop} / {MAX_LOOP_COUNT})
              </LoopProgressInfo>
            )}

            {/* 자동 루프 체크박스 - Next Loop 버튼이 있는 상황에서도 항상 표시 */}
            {currentLoop < MAX_LOOP_COUNT && (
              <AutoLoopCheckbox>
                <CheckboxInput
                  type="checkbox"
                  id="autoLoop"
                  checked={isAutoLoop}
                  onChange={(e) => {
                    // 체크박스만 체크하는 것으로는 루프가 시작되지 않음
                    // Next Loop 버튼을 눌러야 자동 루프가 시작됨
                    setIsAutoLoop(e.target.checked);
                    // 체크박스를 체크할 때는 isLoopRunning을 false로 유지
                    if (e.target.checked) {
                      setIsLoopRunning(false);
                    }
                  }}
                  disabled={isLoopRunning} // 루프 진행 중일 때는 비활성화
                />
                <CheckboxLabel htmlFor="autoLoop">
                  Auto continue loops (up to {MAX_LOOP_COUNT} loops)
                </CheckboxLabel>
              </AutoLoopCheckbox>
            )}

            {/* 최초 루프(1회차)일 때만 pass된 이미지 리스트 표시 */}
            {currentLoop === 1 && firstLoopPassedImages.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <CycleSection>
                  <CycleHeader>
                    <CycleTitle>Passed Images (Loop 1)</CycleTitle>
                    <CycleBadge>
                      Total: {firstLoopPassedImages.length}
                    </CycleBadge>
                  </CycleHeader>

                  {/* 파일명 리스트 */}
                  <FileListContainer>
                    {firstLoopPassedImages.map((imageData, index) => (
                      <FileListItem
                        key={index}
                        onClick={() => {
                          setIsFirstLoopImageList(true);
                          handleFileNameClick(imageData, index);
                        }}
                      >
                        {imageData.fileName}
                      </FileListItem>
                    ))}
                  </FileListContainer>
                </CycleSection>
              </div>
            )}

            {/* 루프 히스토리 표시 */}
            {loopResults.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b6b5c5",
                    marginBottom: "8px",
                  }}
                >
                  Loop History:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#ffffff",
                  }}
                >
                  {loopResults.map((result, index) => (
                    <div key={index}>
                      Loop {result.loop}: Pass {result.passed} / Fail{" "}
                      {result.failed}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </LoopCompleteSection>

          <ActionButtons>
            {/* 자동 루프가 실행 중일 때는 Stop 버튼만 표시 */}
            {isAutoLoop && isLoopRunning && (
              <Button className="danger" onClick={handleStopLoop}>
                Stop Auto Loop
              </Button>
            )}
            {/* 자동 루프가 비활성화되어 있거나, 자동 루프가 활성화되어 있지만 실행 중이 아닐 때 */}
            {(!isAutoLoop || (isAutoLoop && !isLoopRunning)) && (
              <>
                {currentLoop < MAX_LOOP_COUNT ? (
                  <>
                    <Button className="danger" onClick={handleStopLoop}>
                      Stop Loop
                    </Button>
                    <Button className="primary" onClick={handleNextLoop}>
                      Next Loop
                    </Button>
                  </>
                ) : (
                  <Button className="primary" onClick={handleViewFinalResults}>
                    View Final Results
                  </Button>
                )}
              </>
            )}
            {/* 자동 루프가 활성화되어 있고 최대 횟수에 도달했을 때 */}
            {isAutoLoop && !isLoopRunning && currentLoop >= MAX_LOOP_COUNT && (
              <Button className="primary" onClick={handleViewFinalResults}>
                View Final Results
              </Button>
            )}
          </ActionButtons>

          {/* 이미지 모달 (loopComplete 상태에서도 표시) */}
          {isImageModalOpen && selectedImage && (
            <ImageModalOverlay onClick={handleCloseImageModal}>
              <ImageModalContent onClick={(e) => e.stopPropagation()}>
                <ImageModalClose onClick={handleCloseImageModal}>
                  ×
                </ImageModalClose>
                {(() => {
                  // 최초 루프 이미지 리스트인 경우 firstLoopPassedImages 사용
                  const modalList = isFirstLoopImageList
                    ? firstLoopPassedImages
                    : activeTab === "pass"
                    ? resultImages
                    : failedImages;
                  return (
                    <>
                      {modalList.length > 1 && (
                        <ImageNavButton
                          className="prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage();
                          }}
                          disabled={selectedImageIndex === 0}
                        >
                          ‹
                        </ImageNavButton>
                      )}
                      {modalList.length > 1 && (
                        <ImageNavButton
                          className="next"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          disabled={selectedImageIndex === modalList.length - 1}
                        >
                          ›
                        </ImageNavButton>
                      )}
                      <ImageModalImage
                        src={selectedImage.url}
                        alt={selectedImage.fileName}
                      />
                      <ImageModalFileName>
                        {selectedImage.fileName} ({selectedImageIndex + 1} /{" "}
                        {modalList.length})
                      </ImageModalFileName>
                    </>
                  );
                })()}
              </ImageModalContent>
            </ImageModalOverlay>
          )}
        </>
      );
    }

    // 최종 완료 상태
    if (autoLabelingStatus === "finalComplete") {
      return (
        <>
          <StatusCard $isCompleted={true}>
            <StatusIcon $isCompleted={true}>{CheckIcon}</StatusIcon>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <StatusTitle>All Loops Completed!</StatusTitle>
              <StatusDescription>
                All {currentLoop} loops have been successfully processed.
                <br />
                Click "View Final Results" to see the detailed results.
              </StatusDescription>
            </div>
          </StatusCard>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button className="primary" onClick={handleViewFinalResults}>
              View Final Results
            </Button>
          </ActionButtons>
        </>
      );
    }

    // 최종 결과 표시 상태 (기존 AutoLabelingModal과 동일)
    if (autoLabelingStatus === "showingResults") {
      const currentList = activeTab === "pass" ? resultImages : failedImages;
      const passCount = resultImages.length;
      const failCount = failedImages.length;

      return (
        <>
          <CycleSection>
            <CycleHeader>
              <CycleTitle>Final Auto Labeling Results</CycleTitle>
              <CycleBadge>Total: {passCount + failCount}</CycleBadge>
            </CycleHeader>

            {/* 통계 표시 */}
            <ResultGrid>
              <ResultCard>
                <ResultLabel>PASS</ResultLabel>
                <ResultValue type="pass">{passCount}</ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>FAIL</ResultLabel>
                <ResultValue type="fail">{failCount}</ResultValue>
              </ResultCard>
            </ResultGrid>

            {/* 탭 버튼 */}
            <TabButtons>
              <TabButton
                $active={activeTab === "pass"}
                onClick={() => setActiveTab("pass")}
              >
                PASS ({passCount})
              </TabButton>
              <TabButton
                $active={activeTab === "fail"}
                onClick={() => setActiveTab("fail")}
              >
                FAIL ({failCount})
              </TabButton>
            </TabButtons>

            {/* 파일명 리스트 */}
            <FileListContainer>
              {currentList.length > 0 ? (
                currentList.map((imageData, index) => (
                  <FileListItem
                    key={index}
                    onClick={() => handleFileNameClick(imageData, index)}
                  >
                    {imageData.fileName}
                  </FileListItem>
                ))
              ) : (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#b6b5c5",
                  }}
                >
                  {activeTab === "pass"
                    ? "PASS된 이미지가 없습니다."
                    : "FAIL된 이미지가 없습니다."}
                </div>
              )}
            </FileListContainer>
          </CycleSection>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
          </ActionButtons>

          {/* 이미지 모달 */}
          {isImageModalOpen && selectedImage && (
            <ImageModalOverlay onClick={handleCloseImageModal}>
              <ImageModalContent onClick={(e) => e.stopPropagation()}>
                <ImageModalClose onClick={handleCloseImageModal}>
                  ×
                </ImageModalClose>
                {(() => {
                  // 최초 루프 이미지 리스트인 경우 firstLoopPassedImages 사용
                  const modalList = isFirstLoopImageList
                    ? firstLoopPassedImages
                    : activeTab === "pass"
                    ? resultImages
                    : failedImages;
                  return (
                    <>
                      {modalList.length > 1 && (
                        <ImageNavButton
                          className="prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage();
                          }}
                          disabled={selectedImageIndex === 0}
                        >
                          ‹
                        </ImageNavButton>
                      )}
                      {modalList.length > 1 && (
                        <ImageNavButton
                          className="next"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          disabled={selectedImageIndex === modalList.length - 1}
                        >
                          ›
                        </ImageNavButton>
                      )}
                      <ImageModalImage
                        src={selectedImage.url}
                        alt={selectedImage.fileName}
                      />
                      <ImageModalFileName>
                        {selectedImage.fileName} ({selectedImageIndex + 1} /{" "}
                        {modalList.length})
                      </ImageModalFileName>
                    </>
                  );
                })()}
              </ImageModalContent>
            </ImageModalOverlay>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Auto Labeling Demo</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        {renderContent()}
      </ModalContent>
    </ModalOverlay>
  );
}
