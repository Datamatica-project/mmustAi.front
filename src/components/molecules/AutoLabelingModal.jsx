import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAutoLabelingResult,
  getProject,
  getProjectDetail,
  startAutoLabeling,
} from "../../api/Project";
// import {
//   startAutoLabeling,
//   getAutoLabelingStatus,
//   getAutoLabelingCycleResult,
//   getProject,
// } from "../../api/Project";
import { useToastStore } from "../../store/toastStore";
import { getOriginalImageUrl } from "../../api/File";
import confetti from "canvas-confetti";
import { CheckIcon } from "../icons/Icons";
import { classes as defaultClasses } from "../../data";

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

const PhaseText = styled.div`
  font-size: 14px;
  color: #b6b5c5;
  margin-top: 8px;
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

// const CheckIcon = styled.div`
//   width: 40px;
//   height: 40px;
//   position: relative;

//   &::before,
//   &::after {
//     content: "";
//     position: absolute;
//     background-color: #ffffff;
//     border-radius: 2px;
//   }

//   &::before {
//     width: 4px;
//     height: 20px;
//     left: 14px;
//     top: 20px;
//     transform: rotate(45deg);
//   }

//   &::after {
//     width: 4px;
//     height: 12px;
//     left: 22px;
//     top: 24px;
//     transform: rotate(-45deg);
//   }
// `;

// 라벨링된 클래스 정보 표시용 스타일 컴포넌트
const LabeledClassesSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #3b3c5d;
`;

const LabeledClassesTitle = styled.div`
  font-size: 14px;
  color: #b6b5c5;
  font-weight: 500;
  margin-bottom: 12px;
`;

const LabeledClassesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ClassBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #2a2b3d;
  border-radius: 6px;
  border: 1px solid #3b3c5d;
`;

const ClassColorDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color || "#ffffff"};
`;

const ClassName = styled.span`
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
`;

const ClassCount = styled.span`
  font-size: 13px;
  color: #b6b5c5;
  font-weight: 600;
`;

const ClassBalanceInfo = styled(InfoMessage)`
  margin-top: 12px;
`;

// 학습이 안된 클래스 섹션 스타일 (비슷한 UI)
const IncompleteClassesSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #3b3c5d;
`;

const IncompleteClassesTitle = styled.div`
  font-size: 14px;
  color: #b6b5c5;
  font-weight: 500;
  margin-bottom: 12px;
`;

const IncompleteClassesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const IncompleteClassLink = styled.a`
  font-size: 13px;
  color: #f62579;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #ea257f;
  }
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

// 이미지 네비게이션 화살표 버튼
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
  projectData,
  onComplete,
  projectId,
}) {
  const navigate = useNavigate();
  const [autoLabelingStatus, setAutoLabelingStatus] = useState("idle"); // idle, running, completed, showingResults
  const [manualLabelingProgress, setManualLabelingProgress] = useState(0);
  const [labeledClasses, setLabeledClasses] = useState([]); // 현재 라벨링된 클래스 정보
  const [incompleteClasses, setIncompleteClasses] = useState([]); // 학습이 완료되지 않은 클래스 목록
  const [resultImages, setResultImages] = useState([]); // 결과 이미지 리스트 (pass)
  const [failedImages, setFailedImages] = useState([]); // 실패 이미지 리스트 (fail)
  const [activeTab, setActiveTab] = useState("pass"); // pass/fail 탭 전환
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 (원본 이미지 URL)
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1); // 선택된 이미지의 인덱스
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 이미지 모달 열림 상태
  const [resultCounts, setResultCounts] = useState({ passed: 0, failed: 0 }); // 성공/실패 개수

  // AI 학습에 필요한 최소 데이터 수 (Classes.jsx와 동일한 값)
  const REQUIRED_DATA_COUNT = 1000;
  const STORAGE_KEY = "customClasses";

  const canStartAutoLabeling = manualLabelingProgress >= 10;

  // 이미지 URL 정리
  useEffect(() => {
    return () => {
      if (selectedImage?.url) {
        URL.revokeObjectURL(selectedImage.url);
      }
    };
  }, [selectedImage]);

  // Confetti 효과 (완료 시)
  useEffect(() => {
    if (autoLabelingStatus === "completed") {
      // 여러 번 발사하여 더 화려한 효과
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
        // 왼쪽에서 발사
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        // 오른쪽에서 발사
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
    setResultImages([]);
    setFailedImages([]);
    setActiveTab("pass");
    setSelectedImage(null);
    setIsImageModalOpen(false);
    setResultCounts({ passed: 0, failed: 0 });

    // 진행률 계산
    const fetchAutoLabelingStatus = async () => {
      const response = await getProject(projectId);
      // 진행률 계산: (승인된 작업 수 / 전체 작업 수) * 100
      // totalJobCount가 0인 경우를 방지하기 위한 체크 추가
      const percentage =
        response.data.totalJobCount > 0
          ? (response.data.approvedJobCount / response.data.totalJobCount) * 100
          : 0;
      setManualLabelingProgress(percentage);
    };

    const currentLabbeldObject = async () => {
      const projectDetail = await getProjectDetail(projectId);
      // labelInfos에서 objectInfos가 있는 클래스만 필터링하여 저장
      // 각 클래스의 이름과 objectInfos.length를 저장
      const classesWithObjects = (projectDetail.data?.labelInfos || [])
        .filter(
          (labelInfo) =>
            labelInfo.objectInfos && labelInfo.objectInfos.length > 0
        )
        .map((labelInfo) => ({
          name: labelInfo.name,
          count: labelInfo.objectInfos.length,
          color: labelInfo.hexColor || "#ffffff",
        }));
      setLabeledClasses(classesWithObjects);

      // 완료되지 않은 클래스 목록 가져오기
      // 기준: Classes 페이지에 있고 Training Complete 상태인 클래스만 완료된 클래스
      // Classes 페이지에 없거나, Training Complete가 아닌 클래스는 미완료 클래스
      // 로컬 스토리지에서 추가된 클래스 가져오기
      const stored = localStorage.getItem(STORAGE_KEY);
      let customClasses = [];
      if (stored) {
        try {
          customClasses = JSON.parse(stored);
        } catch (error) {
          console.error("로컬 스토리지 데이터 파싱 오류:", error);
        }
      }

      // Classes 페이지에 있는 모든 클래스 정보 (기본 클래스 + 추가 클래스)
      // 기본 클래스는 모두 Training Complete 상태 (dataCount = REQUIRED_DATA_COUNT)
      const defaultClassesWithData = defaultClasses.map((cls) => ({
        name: cls.name.toLowerCase(),
        dataCount: REQUIRED_DATA_COUNT, // 기본 클래스는 모두 완료 상태
      }));

      // 추가 클래스는 dataCount 확인 필요
      const customClassesWithData = customClasses.map((cls) => ({
        name: cls.name.toLowerCase(),
        dataCount: cls.dataCount || 0,
      }));

      const allClassesPageClasses = [
        ...defaultClassesWithData,
        ...customClassesWithData,
      ];

      // Training Complete 상태인 클래스만 완료된 클래스로 간주
      // (dataCount >= REQUIRED_DATA_COUNT)
      const completedClassNames = new Set(
        allClassesPageClasses
          .filter((cls) => cls.dataCount >= REQUIRED_DATA_COUNT)
          .map((cls) => cls.name)
      );

      // labeledClasses에서 완료되지 않은 클래스 필터링
      // 1. Classes 페이지에 없는 클래스
      // 2. Classes 페이지에 있지만 Training Complete가 아닌 클래스
      const incomplete = classesWithObjects
        .filter((labeledClass) => {
          const labeledClassName = labeledClass.name.toLowerCase();
          // Classes 페이지에 없으면 미완료
          const existsInClassesPage = allClassesPageClasses.some(
            (cls) => cls.name === labeledClassName
          );
          if (!existsInClassesPage) {
            return true;
          }
          // Classes 페이지에 있지만 Training Complete가 아니면 미완료
          return !completedClassNames.has(labeledClassName);
        })
        .map((classInfo) => ({
          name: classInfo.name,
          color: classInfo.color || "#ffffff",
        }));

      setIncompleteClasses(incomplete);
    };

    fetchAutoLabelingStatus();
    currentLabbeldObject();
  }, [isOpen]);

  const handleStartAutoLabeling = async () => {
    setAutoLabelingStatus("running");

    try {
      const response = await startAutoLabeling(null, projectId);

      // // 결과 확인
      const result = await getAutoLabelingResult(projectId);

      // 성공/실패 개수 저장
      setResultCounts({
        passed: result.passedCount || 0,
        failed: result.failedCount || 0,
      });

      // 토스트 알림 표시
      if (response) {
        useToastStore
          .getState()
          .addToast("오토라벨링이 성공적으로 완료되었습니다.", "success");
      } else {
        useToastStore
          .getState()
          .addToast("오토라벨링 처리 중 오류가 발생했습니다.", "error");
      }

      // 완료 상태로 변경
      setAutoLabelingStatus("completed");
    } catch (error) {
      console.error("Auto labeling error:", error);
      useToastStore
        .getState()
        .addToast("오토라벨링 실행 중 오류가 발생했습니다.", "error");
      setAutoLabelingStatus("idle");
    }
  };

  const handleViewResults = async () => {
    try {
      const result = await getAutoLabelingResult(projectId);
      let passdImages = [];
      let failedImages = [];

      if (result && result.items && Array.isArray(result.items)) {
        const resultItems = result.items;

        // resultPath 파싱 함수
        const parseResultPath = (resultPath) => {
          // resultPath 형식: /workspace/auto_labeling/demo/data/demo_runs/run_20251230_082135_b44872a0/result/fail/01a4933a-252e566a.jpg
          if (!resultPath) return null;

          // /result/ 다음 경로에서 which (pass 또는 fail) 추출
          const resultIndex = resultPath.indexOf("/result/");
          if (resultIndex === -1) return null;

          const afterResult = resultPath.substring(
            resultIndex + "/result/".length
          );
          const parts = afterResult.split("/");
          const which = parts[0]; // pass 또는 fail
          const name = parts[parts.length - 1]; // 마지막 파일명 (01a4933a-252e566a.jpg)

          // runId 추출 (run_으로 시작하는 부분 찾기)
          const runIdMatch = resultPath.match(/run_\d{8}_\d{6}_[a-f0-9]+/);
          const runId = runIdMatch ? runIdMatch[0] : null;

          if (!runId || !name || !which) return null;

          return {
            runId,
            name,
            which,
            fileName: name, // 표시용 파일명
          };
        };

        // passed === true인 항목들의 resultPath 파싱
        passdImages = resultItems
          .filter((item) => item.passed === true)
          .map((item) => parseResultPath(item.resultPath))
          .filter((item) => item !== null); // null 제거

        // passed === false인 항목들의 resultPath 파싱
        failedImages = resultItems
          .filter((item) => item.passed === false)
          .map((item) => parseResultPath(item.resultPath))
          .filter((item) => item !== null); // null 제거

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
  };

  const handleClose = () => {
    setAutoLabelingStatus("idle");
    setResultImages([]);
    setFailedImages([]);
    setActiveTab("pass");
    setSelectedImage(null);
    setIsImageModalOpen(false);
    onClose();
  };
  const handleCloseImageModal = () => {
    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url);
    }
    setSelectedImage(null);
    setSelectedImageIndex(-1);
    setIsImageModalOpen(false);
  };

  const handleFileNameClick = useCallback(async (imageData, index) => {
    try {
      // imageData는 { runId, name, which, fileName } 형태의 객체
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

  // 다음 이미지로 이동
  const handleNextImage = useCallback(async () => {
    const currentList = activeTab === "pass" ? resultImages : failedImages;
    if (selectedImageIndex < currentList.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      const nextImageData = currentList[nextIndex];
      await handleFileNameClick(nextImageData, nextIndex);
    }
  }, [
    activeTab,
    resultImages,
    failedImages,
    selectedImageIndex,
    handleFileNameClick,
  ]);

  // 이전 이미지로 이동
  const handlePrevImage = useCallback(async () => {
    if (selectedImageIndex > 0) {
      const currentList = activeTab === "pass" ? resultImages : failedImages;
      const prevIndex = selectedImageIndex - 1;
      const prevImageData = currentList[prevIndex];
      await handleFileNameClick(prevImageData, prevIndex);
    }
  }, [
    activeTab,
    resultImages,
    failedImages,
    selectedImageIndex,
    handleFileNameClick,
  ]);

  // 키보드 이벤트 처리 (좌우 화살표 키)
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
    if (autoLabelingStatus === "idle" || autoLabelingStatus === "locked") {
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
            {/* 현재 라벨링된 클래스별 오브젝트 개수 표시 */}
            {labeledClasses.length > 0 && (
              <LabeledClassesSection>
                <LabeledClassesTitle>
                  Labeled Objects by Class
                </LabeledClassesTitle>
                <LabeledClassesList>
                  {labeledClasses.map((classInfo, index) => (
                    <ClassBadge key={index}>
                      <ClassColorDot color={classInfo.color} />
                      <ClassName>{classInfo.name}</ClassName>
                      <ClassCount>({classInfo.count})</ClassCount>
                    </ClassBadge>
                  ))}
                </LabeledClassesList>
                {/* 클래스별 개수 균형 안내 메시지 */}
                {labeledClasses.length > 1 && (
                  <ClassBalanceInfo type="warning">
                    For optimal model training performance, try to maintain a
                    similar number of objects across all classes. <br />
                    Balanced class distribution helps improve model accuracy and
                    generalization.
                  </ClassBalanceInfo>
                )}
              </LabeledClassesSection>
            )}
            {/* 학습이 완료되지 않은 클래스 표시 */}
            {incompleteClasses.length > 0 && (
              <IncompleteClassesSection>
                <IncompleteClassesTitle>
                  Classes Not Yet Trained
                </IncompleteClassesTitle>
                <IncompleteClassesList>
                  {incompleteClasses.map((classInfo, index) => (
                    <ClassBadge key={index}>
                      <ClassColorDot color={classInfo.color} />
                      <ClassName>{classInfo.name}</ClassName>
                    </ClassBadge>
                  ))}
                </IncompleteClassesList>
                <IncompleteClassLink
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/classes");
                    handleClose();
                  }}
                >
                  Go to train these classes →
                </IncompleteClassLink>
              </IncompleteClassesSection>
            )}
          </ProgressSection>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              className="primary"
              onClick={handleStartAutoLabeling}
              // disabled={!canStartAutoLabeling}
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
                Our AI is analyzing and labeling your images. This may take a
                few moments.
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

    // 완료 상태 (성공 메시지 + 결과 보기 버튼)
    if (autoLabelingStatus === "completed") {
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
              <StatusTitle>Auto Labeling Completed!</StatusTitle>
              <StatusDescription>
                Your images have been successfully processed and labeled.
                <br />
                Click "View Results" to see the detailed results.
              </StatusDescription>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                <StatusBadge $isCompleted={true}>
                  <span>✓ Pass: {resultCounts.passed}</span>
                </StatusBadge>
                <StatusBadge
                  $isCompleted={false}
                  style={{
                    backgroundColor: "#f44336",
                    color: "#ffffff",
                  }}
                >
                  <span>✗ Fail: {resultCounts.failed}</span>
                </StatusBadge>
              </div>
            </div>
          </StatusCard>

          <ActionButtons>
            <Button className="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button className="primary" onClick={handleViewResults}>
              View Results
            </Button>
          </ActionButtons>
        </>
      );
    }

    // 결과 표시 상태
    if (autoLabelingStatus === "showingResults") {
      const currentList = activeTab === "pass" ? resultImages : failedImages;
      const passCount = resultImages.length;
      const failCount = failedImages.length;

      return (
        <>
          <CycleSection>
            <CycleHeader>
              <CycleTitle>Auto Labeling Results</CycleTitle>
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

            {/* 파일명 리스트 (간단한 키값으로 표시) */}
            <FileListContainer>
              {currentList.length > 0 ? (
                currentList.map((imageData, index) => (
                  <FileListItem
                    key={index}
                    onClick={() => handleFileNameClick(imageData, index)}
                  >
                    {/* {activeTab === "pass" ? "PASS" : "FAIL"}-{index + 1} */}
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
                {/* 이전 이미지 버튼 */}
                {currentList.length > 1 && (
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
                {/* 다음 이미지 버튼 */}
                {currentList.length > 1 && (
                  <ImageNavButton
                    className="next"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    disabled={selectedImageIndex === currentList.length - 1}
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
                  {currentList.length})
                </ImageModalFileName>
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
          <ModalTitle>Auto Labeling</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        {renderContent()}
      </ModalContent>
    </ModalOverlay>
  );
}
