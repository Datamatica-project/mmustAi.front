import React from "react";
import styled, { keyframes } from "styled-components";
import { useToastStore } from "../../store/toastStore";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
`;

const Toast = styled.div`
  background-color: #2a2b3f;
  border-left: 4px solid
    ${(props) => {
      switch (props.$type) {
        case "success":
          return "#4caf50";
        case "error":
          return "#f44336";
        case "warning":
          return "#ff9800";
        default:
          return "#2196f3";
      }
    }};
  color: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  pointer-events: auto;
  animation: ${slideIn} 0.3s ease-out;

  &.removing {
    animation: ${slideOut} 0.3s ease-out;
  }
`;

const Message = styled.span`
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <Container>
      {toasts.map((toast) => (
        <Toast key={toast.id} $type={toast.type}>
          <Message>{toast.message}</Message>
          <CloseButton onClick={() => removeToast(toast.id)}>×</CloseButton>
        </Toast>
      ))}
    </Container>
  );
}
