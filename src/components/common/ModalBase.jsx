import React from "react";
import styled from "styled-components";
import { ClipboardXIcon } from "../icons/Icons";

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  cursor: pointer;
`;

const ModalContent = styled.div`
  cursor: default;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #363756;
  padding: 40px;
  border-radius: 10px;
  width: 500px;
  height: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .icon {
    width: 82px;
    height: 82px;
    border-radius: 50%;
    background-color: #f62579;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      color: #fff;
      width: 50px;
      height: 50px;
    }
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #9c9ec9;
    margin-top: 20px;
  }
  .description {
    margin-top: 10px;
    font-size: 16px;
    color: #ffffff;
    font-weight: 500;
  }
`;

export default function ModalBase({ children, className, onClose }) {
  return (
    <Modal onClick={onClose}>
      <ModalContent className={className} onClick={(e) => e.stopPropagation()}>
        <div className="icon">{ClipboardXIcon}</div>
        <h2 className="title">Send Feedback</h2>
        <p className="description">
          Please provide a reason for rejecting this object.
        </p>
        {children}
      </ModalContent>
    </Modal>
  );
}
