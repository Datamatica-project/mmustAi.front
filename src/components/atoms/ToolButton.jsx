import React from "react";
import styled from "styled-components";

const Button = styled.button`
  background-color: #282943;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 800;
  color: #5e5f7d;
  padding: 20px;
  min-width: 160px;
  position: relative;
  font-family: inherit;
  display: flex;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
  cursor: pointer;
  transition-duration: 100ms;

  &.active {
    background-color: #3b3c5d;
    color: #fff;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background-color: #f62579;
    }
  }
`;

export default function ToolButton({ active, onClick, icon, title }) {
  return (
    <Button onClick={onClick} className={active ? "active" : ""}>
      {icon} {title}
    </Button>
  );
}
