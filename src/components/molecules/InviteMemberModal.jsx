import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useToastStore } from "../../store/toastStore";
import { getMembers, inviteMembers } from "../../api/Project";
import { getTaskDetail } from "../../api/Task";

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
  max-width: 700px;
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

const Section = styled.div`
  margin-bottom: 24px;

  .description {
    font-size: 14px;
    color: #7b7d95;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
`;

const InputGroup = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  .description {
    font-size: 13px;
    color: #ffffff;
    line-height: 1.5;
    span {
      font-weight: 500;
      color: #7b7d95;
    }
  }
`;

// 작업자 할당 정보를 표시하는 카드 스타일
const AssignedMembersCard = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: #1c1d2f;
  border-radius: 8px;
  border: 1px solid #2c2e44;
`;

const AssignedMemberRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #2c2e44;
    margin-bottom: 8px;
    padding-bottom: 12px;
  }
`;

const AssignedMemberLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #7b7d95;
  min-width: 80px;
`;

const AssignedMemberValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.$isEmpty ? "#7b7d95" : "#ffffff")};
  font-style: ${(props) => (props.$isEmpty ? "italic" : "normal")};
  flex: 1;
  text-align: right;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  color: #7b7d95;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ea257f;
  background-color: #1c1d2f;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #5b5d75;
  }
`;

const Select = styled.select`
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ea257f;
  background-color: #1c1d2f;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  cursor: pointer;

  option {
    background-color: #1c1d2f;
    color: #ffffff;
  }
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 12px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #1c1d2f;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const MemberEmail = styled.span`
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
`;

const MemberRole = styled.span`
  font-size: 12px;
  color: #b6b5c5;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) => {
    if (props.role === "PROJECT_MANAGER") return "#f62579";
    if (props.role === "WORKER") return "#2abcf5";
    if (props.role === "REVIEWER") return "#46eb83";
    if (props.role === "SYNTHETIC_DATA_OPERATOR") return "#f4c37e";
    return "#5b5d75";
  }};
  color: #ffffff;
  margin-left: 8px;
`;

const RemoveButton = styled.button`
  border: none;
  background: transparent;
  color: #f62579;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  margin-left: 8px;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownInput = styled(Input)`
  cursor: pointer;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #1c1d2f;
  border: 1px solid #ea257f;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const DropdownItem = styled.div`
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  color: #ffffff;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2c2e44;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const EmptyMessage = styled.div`
  padding: 10px 14px;
  font-size: 14px;
  color: #7b7d95;
  text-align: center;
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

const ROLE_OPTIONS = [
  { value: "WORKER", label: "Labeler" },
  { value: "REVIEWER", label: "Reviewer" },
  // { value: "SYNTHETIC_DATA_OPERATOR", label: "Synthetic Data Operator" },
];

const ROLE_LABELS = {
  PROJECT_MANAGER: "Project Manager",
  WORKER: "Labeler",
  REVIEWER: "Reviewer",
  // SYNTHETIC_DATA_OPERATOR: "Synthetic Data Operator",
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  projectId,
  onInviteComplete,
  projectTasksData,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("WORKER");
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tasks, setTasks] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [worker, setWorker] = useState("");

  // 멤버 목록 조회
  useEffect(() => {
    if (!isOpen) return; // 모달이 열려있을 때만 실행

    const fetchMembers = async () => {
      try {
        const response = await getMembers();

        // response.data.items에서 이메일 목록 추출
        if (response?.data?.items) {
          const emails = response.data.items.map((item) => item.email);
          setAvailableMembers(emails);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };
    fetchMembers();
  }, [isOpen]);

  // 모달이 열릴 때 첫 번째 task 자동 선택하여 작업자 데이터 가져오기
  useEffect(() => {
    if (!isOpen) return; // 모달이 열려있을 때만 실행
    if (!projectTasksData || projectTasksData.length === 0) return; // task 데이터가 없으면 실행하지 않음

    const fetchInitialTaskData = async () => {
      const firstTaskId = projectTasksData[0].id;
      setTasks(firstTaskId);

      try {
        // 첫 번째 task의 작업자 데이터 자동으로 가져오기
        const taskDetail = await getTaskDetail(firstTaskId);
        setReviewer(taskDetail.data.reviewerEmail || "");
        setWorker(taskDetail.data.workerEmail || "");
      } catch (error) {
        console.error("Failed to fetch task detail:", error);
        // 에러 발생 시 초기화
        setReviewer("");
        setWorker("");
      }
    };

    fetchInitialTaskData();
  }, [isOpen, projectTasksData]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest("[data-dropdown-container]")) {
        setIsDropdownOpen(false);
        setTasks("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // 검색어로 필터링된 이메일 목록
  const filteredEmails = availableMembers.filter((email) =>
    email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleEmailSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setEmail(value);
    setIsDropdownOpen(true);
  };

  const handleAddMember = () => {
    if (!email.trim()) {
      useToastStore
        .getState()
        .addToast("Please select or enter email.", "error");
      return;
    }

    // 선택된 이메일이 목록에 있는지 확인 (선택 사항)
    if (!availableMembers.includes(email.trim())) {
      useToastStore
        .getState()
        .addToast("Please select an email from the list.", "error");
      return;
    }

    if (members.some((m) => m.email === email.trim())) {
      useToastStore.getState().addToast("Email already added.", "error");
      return;
    }

    setMembers((prev) => [...prev, { email: email.trim(), role }]);
    setEmail("");
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleRemoveMember = (email) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const handleInvite = async () => {
    if (members.length === 0) {
      useToastStore
        .getState()
        .addToast("Please add members to invite.", "error");
      return;
    }

    try {
      const response = await inviteMembers(projectId, members, tasks);

      useToastStore
        .getState()
        .addToast(`${members.length} members invited successfully`, "success");

      if (onInviteComplete) {
        onInviteComplete();
      }

      handleClose();
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Invite error occurred. Please try again.";

      useToastStore.getState().addToast(errorMessage, "error");
    }
  };

  const handleClose = () => {
    setEmail("");
    setSearchQuery("");
    setRole("WORKER");
    setMembers([]);
    setIsDropdownOpen(false);
    // 모달 닫을 때 task 관련 상태도 초기화하여 다음에 열릴 때 첫 번째 task가 자동 선택되도록 함
    setTasks("");
    setReviewer("");
    setWorker("");
    onClose();
  };

  // 태스크 변경 시 태스크 상세 조회
  const handleTaskChange = async (e) => {
    setTasks(e.target.value);
    if (e.target.value === "") {
      setReviewer("");
      setWorker("");
      return;
    }
    const taskDetail = await getTaskDetail(e.target.value);
    setReviewer(taskDetail.data.reviewerEmail);
    setWorker(taskDetail.data.workerEmail);
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Invite Members</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        <Section>
          <SectionTitle>Add New Member</SectionTitle>
          <p className="description">
            Each task can only have one labeler and one reviewer assigned.
          </p>
          <InputGroup>
            <Label>Tasks</Label>
            <Select value={tasks} onChange={(e) => handleTaskChange(e)}>
              <option value="">Select Task</option>
              {projectTasksData.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
            {tasks && (
              <AssignedMembersCard>
                <AssignedMemberRow>
                  <AssignedMemberLabel>Labeler</AssignedMemberLabel>
                  <AssignedMemberValue $isEmpty={!worker}>
                    {worker || "None"}
                  </AssignedMemberValue>
                </AssignedMemberRow>
                <AssignedMemberRow>
                  <AssignedMemberLabel>Reviewer</AssignedMemberLabel>
                  <AssignedMemberValue $isEmpty={!reviewer}>
                    {reviewer || "None"}
                  </AssignedMemberValue>
                </AssignedMemberRow>
              </AssignedMembersCard>
            )}
          </InputGroup>
          <InputGroup>
            <Label>Email</Label>
            <DropdownContainer data-dropdown-container>
              <DropdownInput
                type="text"
                placeholder="Search or select email..."
                value={searchQuery || email}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddMember();
                  }
                }}
              />
              {isDropdownOpen && filteredEmails.length > 0 && (
                <DropdownList>
                  {filteredEmails
                    .filter((email) => !members.some((m) => m.email === email))
                    .map((emailItem) => (
                      <DropdownItem
                        key={emailItem}
                        onClick={() => handleEmailSelect(emailItem)}
                      >
                        {emailItem}
                      </DropdownItem>
                    ))}
                </DropdownList>
              )}
              {isDropdownOpen && filteredEmails.length === 0 && (
                <DropdownList>
                  <EmptyMessage>No matching emails found</EmptyMessage>
                </DropdownList>
              )}
            </DropdownContainer>
          </InputGroup>
          <InputGroup>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </InputGroup>

          <Button className="primary" onClick={handleAddMember}>
            Add
          </Button>
        </Section>

        {members.length > 0 && (
          <Section>
            <SectionTitle>
              Invite Members List ({members.length} members)
            </SectionTitle>
            <MemberList>
              {members.map((member, index) => (
                <MemberItem key={index}>
                  <MemberInfo>
                    <MemberEmail>
                      {member.email}
                      <RoleBadge role={member.role}>
                        {ROLE_LABELS[member.role]}
                      </RoleBadge>
                    </MemberEmail>
                  </MemberInfo>
                  <RemoveButton
                    onClick={() => handleRemoveMember(member.email)}
                  >
                    ✕
                  </RemoveButton>
                </MemberItem>
              ))}
            </MemberList>
          </Section>
        )}

        <ActionButtons>
          <Button className="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="primary"
            onClick={handleInvite}
            disabled={members.length === 0}
          >
            Invite
          </Button>
        </ActionButtons>
      </ModalContent>
    </ModalOverlay>
  );
}
