import styled from "styled-components";

export const Button = styled.button`
  white-space: nowrap;
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

  &.tool-button.active {
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
