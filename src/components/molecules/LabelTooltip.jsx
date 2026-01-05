import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { CheckIcon, CrossIcon } from "../icons/Icons";

const Container = styled.div`
  position: absolute;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  background-color: #363756;
  padding: 20px;
  border-radius: 8px;
  box-sizing: border-box;
  box-shadow: 0px 4px 16.2px rgba(0, 0, 0, 0.57);
  display: flex;
  flex-direction: column;
  gap: 15px;

  h4 {
    font-size: 20px;
    color: #f8f8f8;
    text-align: center;
    font-weight: 700;
  }

  .colorCircle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`;
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  input {
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    border: 2px solid ${(props) => (props.$hasError ? "#f44468" : "#5b5d75")};
    border-radius: 4px;
    background-color: #2a2b3d;
    color: #fff;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${(props) => (props.$hasError ? "#f44468" : "#f62579")};
    }
  }
  .selected-class {
    transition-duration: 150ms;
    color: ${(props) =>
      props.$selectedClass === "No Class" ? "#9192b7" : "#fff"};
    font-size: 15px;
    margin-bottom: 5px;
  }
  .class-list {
    background-color: #1c1d2f;
    height: 125px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #fff #1c1d2f;
    li {
      padding: 10px;
      cursor: pointer;
      &.selected {
        background-color: #4e5078;
      }
      &:hover {
        background-color: #4e50789b;
      }
    }
  }
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background-color: transparent;
    border: 1px solid#5B5D75;
    color: #fff;
    transition-duration: 100ms;
    cursor: pointer;
    padding: 12px 20px;
    border-radius: 8px;
    span {
      font-size: 15px;
      color: #fff;
    }
  }

  .clear-btn {
    color: #f44468;
    &:hover {
      background-color: #f02b50;
      color: #fff;
    }
  }
  .confirm-btn {
    color: #46eb83;
    &:hover {
      background-color: #32d36d;
      color: #fff;
    }
  }
`;
export default function LabelTooltip({
  x,
  y,
  classes,
  onConfirm,
  onCancle,
  labelData,
  setLabelData,
}) {
  const inputRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  // 에러 상태가 true가 되면 input에 포커스
  useEffect(() => {
    if (hasError && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasError]);

  const handleConfirm = () => {
    // 객체 이름이 비어있으면 에러 표시 및 포커스
    if (!labelData.objectName || labelData.objectName.trim() === "") {
      setHasError(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    // 에러 상태 초기화 후 확인 처리
    setHasError(false);
    onConfirm();
  };

  const handleInputChange = (e) => {
    // 입력 시 에러 상태 초기화
    if (hasError) {
      setHasError(false);
    }
    setLabelData({ ...labelData, objectName: e.target.value });
  };

  return (
    <Container $x={x} $y={y}>
      <h4>Select Class</h4>
      <InputContainer $selectedClass={labelData.className} $hasError={hasError}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Object Name"
          value={labelData.objectName}
          onChange={handleInputChange}
        />
        <span className="selected-class">Class: {labelData.className}</span>
        <ul className="class-list">
          {classes.map((cls) => (
            <li
              key={cls.id}
              onClick={() =>
                setLabelData({ ...labelData, className: cls.name, id: cls.id })
              }
              className={labelData.className === cls.name ? "selected" : ""}
            >
              <span className="colorCircle" />
              {cls.name}
            </li>
          ))}
        </ul>
      </InputContainer>
      <ButtonContainer>
        <button className="confirm-btn" onClick={handleConfirm}>
          {CheckIcon}
          <span>Confirm</span>
        </button>
        <button className="clear-btn" onClick={onCancle}>
          {CrossIcon}
          <span>Clear</span>
        </button>
      </ButtonContainer>
    </Container>
  );
}
