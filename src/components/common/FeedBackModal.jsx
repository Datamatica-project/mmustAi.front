import React from "react";
import ModalBase from "./ModalBase";
import styled from "styled-components";

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: auto;
  justify-content: center;
`;

const Button = styled.button`
  color: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &.cancel-button {
    background-color: transparent;
    border: 1px solid #5b5d75;
  }

  &.submit-button {
    background-color: #f62579;
    border: none;
  }
`;
const Textarea = styled.textarea`
  margin-top: 37px;
  width: 100%;
  height: 100px;
  border: none;
  background-color: #1c1d2f;
  border-radius: 5px;
  padding: 8px 10px;
  resize: none;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;

  &::placeholder {
    color: rgba(88, 89, 127, 0.41);
    font-weight: 700;
  }

  &:focus {
    outline: none;
  }
`;

export default function FeedBackModal({ onClose }) {
  return (
    <ModalBase className="feed-back-modal" onClose={onClose}>
      <Textarea placeholder="Describe any issues or leave feedback here..." />
      <ButtonContainer>
        <Button className="cancel-button" onClick={onClose}>
          Cancle
        </Button>
        <Button className="submit-button">Submit</Button>
      </ButtonContainer>
    </ModalBase>
  );
}
