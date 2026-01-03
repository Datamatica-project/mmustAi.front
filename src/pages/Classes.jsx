import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { classes as defaultClasses } from "../data";
import { useToastStore } from "../store/toastStore";

// 로컬 스토리지 키 상수
const STORAGE_KEY = "customClasses";
// AI 학습에 필요한 최소 데이터 수 (한 곳에서 관리하여 쉽게 변경 가능)
const REQUIRED_DATA_COUNT = 1000;

// 컨테이너 스타일
const Container = styled.div`
  width: 100%;
  padding: 40px 60px;
  color: #ffffff;
  background-color: #1c1d2f;
  min-height: 100vh;
`;

// 제목 섹션
const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  line-height: 2;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #a7a7a7;
  margin-bottom: 40px;
`;

// 섹션 스타일
const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
`;

// 클래스 추가 섹션
const AddClassSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
`;

const AddClassInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #ea257f;
  background-color: #1c1d2f;
  color: #ffffff;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #c3c3c3;
  }

  &:focus {
    border-color: #f62579;
    box-shadow: 0 0 0 3px rgba(246, 37, 121, 0.1);
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background-color: #f62579;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ea257f;
  }

  &:disabled {
    background-color: #4f5973;
    cursor: not-allowed;
  }
`;

// 클래스 리스트 (2열 그리드 레이아웃)
const ClassList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 500px);
  gap: 16px;
  justify-content: start;
`;

// 클래스 카드 (기본 클래스와 추가 클래스 모두 동일한 스타일)
const ClassCard = styled.div`
  box-sizing: border-box;
  width: 500px;
  background-color: #282943;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${(props) => (props.$isComplete ? "#4caf50" : "#3b3c5d")};
  box-shadow: ${(props) =>
    props.$isComplete ? "0 0 20px rgba(76, 175, 80, 0.2)" : "none"};
`;

const ClassHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ClassName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CompleteBadge = styled.span`
  background-color: #4caf50;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

// 삭제 버튼 스타일 (미완료된 클래스에만 표시)
const DeleteButton = styled.button`
  background-color: #f44336;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #d32f2f;
  }

  &:active {
    background-color: #b71c1c;
  }
`;

const ClassDate = styled.p`
  font-size: 13px;
  color: #a7a7a7;
  margin: 0 0 16px 0;
`;

// 진행률 그래프 섹션
const ProgressSection = styled.div`
  margin-top: 12px;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #b6b5c5;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 24px;
  background-color: #1c1d2f;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f62579 0%, #ea257f 100%);
  border-radius: 12px;
  transition: width 0.3s ease;
  width: ${(props) => props.$percentage}%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressBarText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
`;

// 삭제 확인 모달 스타일
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
  max-width: 500px;
  border: 1px solid #2c2e44;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
`;

const ModalMessage = styled.p`
  font-size: 16px;
  color: #b6b5c5;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const WarningText = styled.span`
  color: #f44336;
  font-weight: 600;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.cancel-button {
    background-color: transparent;
    border: 1px solid #5b5d75;
    color: #b6b5c5;

    &:hover {
      border-color: #7b7d95;
      color: #ffffff;
    }
  }

  &.confirm-button {
    background-color: #f44336;
    color: #ffffff;

    &:hover {
      background-color: #d32f2f;
    }

    &:active {
      background-color: #b71c1c;
    }
  }
`;

export default function Classes() {
  // 추가된 클래스 목록 상태
  const [customClasses, setCustomClasses] = useState([]);
  // 새 클래스 이름 입력 상태
  const [newClassName, setNewClassName] = useState("");
  // 삭제 확인 모달 상태 (삭제할 클래스 ID 저장)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  // input 필드에 대한 ref (포커싱을 위해 사용)
  const inputRef = useRef(null);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomClasses(parsed);
      } catch (error) {
        console.error("로컬 스토리지 데이터 파싱 오류:", error);
        // 파싱 실패 시 빈 배열로 초기화
        setCustomClasses([]);
      }
    }
  }, []);

  // 로컬 스토리지에 저장하는 함수
  const saveToLocalStorage = (classes) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  };

  // 새 클래스 추가 함수
  const handleAddClass = () => {
    // 입력값 검증: 빈 문자열이거나 공백만 있는 경우 추가하지 않음
    const trimmedName = newClassName.trim();
    if (!trimmedName) {
      return;
    }

    // 중복 체크: 같은 이름의 클래스가 이미 있는지 확인
    const isDuplicate =
      customClasses.some(
        (cls) => cls.name.toLowerCase() === trimmedName.toLowerCase()
      ) ||
      defaultClasses.some(
        (cls) => cls.name.toLowerCase() === trimmedName.toLowerCase()
      );

    if (isDuplicate) {
      useToastStore.getState().addToast("Class name already exists.", "error");
      // 입력 필드 초기화 및 포커싱
      setNewClassName("");
      // 다음 프레임에서 포커싱 (상태 업데이트 후 실행되도록)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return;
    }

    // 새 클래스 객체 생성
    const newClass = {
      id: Date.now().toString(), // 고유 ID 생성 (타임스탬프 사용)
      name: trimmedName,
      createdAt: new Date().toISOString(), // ISO 형식으로 날짜 저장
      dataCount: 0, // 초기 데이터 수는 0
    };

    // 상태 업데이트 및 로컬 스토리지 저장
    const updatedClasses = [...customClasses, newClass];
    setCustomClasses(updatedClasses);
    saveToLocalStorage(updatedClasses);

    // 입력 필드 초기화
    setNewClassName("");
  };

  // Enter 키로 클래스 추가
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddClass();
    }
  };

  // 날짜 포맷팅 함수 (YYYY-MM-DD 형식)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 진행률 계산 함수
  const calculateProgress = (dataCount) => {
    return Math.min((dataCount / REQUIRED_DATA_COUNT) * 100, 100);
  };

  // 학습 완료 여부 확인 함수
  const isComplete = (dataCount) => {
    return dataCount >= REQUIRED_DATA_COUNT;
  };

  // 삭제 버튼 클릭 시 모달 열기
  const handleDeleteClick = (classId) => {
    setClassToDelete(classId);
    setDeleteModalOpen(true);
  };

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setClassToDelete(null);
  };

  // 클래스 삭제 확인 함수 (모달에서 확인 버튼 클릭 시 실행)
  const handleConfirmDelete = () => {
    if (classToDelete) {
      // 해당 클래스를 제외한 나머지 클래스들만 필터링
      const updatedClasses = customClasses.filter(
        (cls) => cls.id !== classToDelete
      );
      setCustomClasses(updatedClasses);
      // 로컬 스토리지에도 반영
      saveToLocalStorage(updatedClasses);
      // 모달 닫기
      handleCloseModal();
    }
  };

  // 기본 클래스를 카드 형태로 표시하기 위한 데이터 변환
  // 기본 클래스는 모두 학습 완료 상태(1000장 충족)로 표시
  const defaultClassesWithData = defaultClasses.map((cls) => ({
    id: cls.id,
    name: cls.name,
    dataCount: REQUIRED_DATA_COUNT, // 기본 클래스는 모두 학습 완료 상태
    isDefault: true, // 기본 클래스 구분용 플래그
  }));

  // 모든 클래스를 하나의 배열로 합치기 (기본 클래스 먼저, 그 다음 추가 클래스)
  const allClasses = [...defaultClassesWithData, ...customClasses];

  return (
    <Container>
      <Title>Class Management</Title>
      <Description>Manage and add classes.</Description>

      {/* 클래스 섹션 */}
      <Section>
        <SectionTitle>Classes ({allClasses.length})</SectionTitle>

        {/* 클래스 리스트 (기본 클래스 + 추가 클래스) */}
        {allClasses.length > 0 && (
          <ClassList>
            {allClasses.map((cls) => {
              // 기본 클래스는 항상 완료 상태, 추가 클래스는 dataCount에 따라 결정
              const progress = calculateProgress(cls.dataCount);
              const complete = isComplete(cls.dataCount);

              return (
                <ClassCard key={cls.id} $isComplete={complete}>
                  <ClassHeader>
                    <ClassName>{cls.name}</ClassName>
                    <HeaderRight>
                      {/* 학습 완료 배지 표시 */}
                      {complete && (
                        <CompleteBadge>Training Complete</CompleteBadge>
                      )}
                      {/* 미완료된 추가 클래스에만 삭제 버튼 표시 (기본 클래스는 삭제 불가) */}
                      {!complete && !cls.isDefault && (
                        <DeleteButton onClick={() => handleDeleteClick(cls.id)}>
                          Delete
                        </DeleteButton>
                      )}
                    </HeaderRight>
                  </ClassHeader>
                  {/* 기본 클래스는 날짜 표시하지 않음, 추가 클래스만 날짜 표시 */}
                  {!cls.isDefault && cls.createdAt && (
                    <ClassDate>Added: {formatDate(cls.createdAt)}</ClassDate>
                  )}
                  <ProgressSection>
                    <ProgressInfo>
                      <ProgressText>Training Data Count</ProgressText>
                      <ProgressText>
                        {cls.dataCount} / {REQUIRED_DATA_COUNT}
                      </ProgressText>
                    </ProgressInfo>
                    <ProgressBarContainer>
                      <ProgressBar $percentage={progress} />
                      <ProgressBarText>{Math.round(progress)}%</ProgressBarText>
                    </ProgressBarContainer>
                  </ProgressSection>
                </ClassCard>
              );
            })}
          </ClassList>
        )}

        {/* 클래스 추가 섹션 */}
        <SectionTitle style={{ marginTop: "32px" }}>Add Class</SectionTitle>
        <AddClassSection>
          <AddClassInput
            ref={inputRef}
            type="text"
            placeholder="Enter new class name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <AddButton onClick={handleAddClass} disabled={!newClassName.trim()}>
            Add
          </AddButton>
        </AddClassSection>
      </Section>

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Class</ModalTitle>
            <ModalMessage>
              Are you sure you want to delete this class?
              <br />
              <WarningText>
                Deleting this class may reset all training image data.
              </WarningText>
            </ModalMessage>
            <ModalButtonContainer>
              <ModalButton className="cancel-button" onClick={handleCloseModal}>
                Cancel
              </ModalButton>
              <ModalButton
                className="confirm-button"
                onClick={handleConfirmDelete}
              >
                Delete
              </ModalButton>
            </ModalButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
