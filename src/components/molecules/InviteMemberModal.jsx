import React, { useState } from "react";
import styled from "styled-components";
import { useToastStore } from "../../store/toastStore";
import { inviteMembers } from "../../api/Project";

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
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
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
    if (props.role === "LABELER") return "#2abcf5";
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
  { value: "LABELER", label: "Labeler" },
  { value: "REVIEWER", label: "Reviewer" },
  { value: "SYNTHETIC_DATA_OPERATOR", label: "Synthetic Data Operator" },
];

const ROLE_LABELS = {
  PROJECT_MANAGER: "Project Manager",
  LABELER: "Labeler",
  REVIEWER: "Reviewer",
  SYNTHETIC_DATA_OPERATOR: "Synthetic Data Operator",
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  projectId,
  onInviteComplete,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("LABELER");
  const [members, setMembers] = useState([]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!email.trim()) {
      useToastStore.getState().addToast("Please enter email.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      useToastStore.getState().addToast("Invalid email format.", "error");
      return;
    }

    if (members.some((m) => m.email === email)) {
      useToastStore.getState().addToast("Email already added.", "error");
      return;
    }

    setMembers((prev) => [...prev, { email: email.trim(), role }]);
    setEmail("");
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
      await inviteMembers(projectId, members);
      useToastStore
        .getState()
        .addToast(`${members.length} members invited successfully`, "success");

      if (onInviteComplete) {
        onInviteComplete();
      }

      handleClose();
    } catch (error) {
      console.error("Invite error:", error);
      useToastStore
        .getState()
        .addToast("Invite error occurred. Please try again.", "error");
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("LABELER");
    setMembers([]);
    onClose();
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
          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddMember();
                }
              }}
            />
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
