import React from "react";
import styled from "styled-components";

const ListItem = styled.li`
  transition-duration: 100ms;
  background-color: transparent;
  display: flex;
  align-items: center;
  padding: 13px;
  border-radius: 8px;
  box-sizing: border-box;
  gap: 20px;
  position: relative;
  cursor: pointer;

  .Wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 10px;
    h4 {
      color: #9193bb;
      font-size: 14px;
      font-weight: 700;
    }

    span {
      font-size: 16px;
      font-weight: 700;
    }
  }

  .objectCount {
    font-size: 20px;
    font-weight: 700;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    border-bottom: 1px solid #3b3c5d;
  }

  &.selected {
    background-color: #3b3c5d;

    &::after {
      content: "";
      border-bottom: none;
    }
  }
`;

const ColorCircle = styled.div`
  width: 17px;
  height: 17px;
  background-color: ${(props) => props.$color};
  border: 1px solid rgba(255, 255, 255, 0.36);
  box-shadow: 0px 0px 5.2px 3px rgba(255, 0, 0, 0.25);
  box-shadow: 0px 0px 5.2px 3px
    ${(props) => `color-mix(in srgb, ${props.$color} 25%, transparent)`};
  border-radius: 50%;
`;

export default function ClassLabel({
  children,
  type = "Class",
  color = "red",
  name = "None",
  isSelected = false,
  onClick,
}) {
  return (
    <ListItem onClick={onClick} className={isSelected ? "selected" : ""}>
      <ColorCircle className="colorCircle" $color={color} />
      <div className="Wrapper">
        <h4>{type}</h4>
        <span>{name}</span>
      </div>
      {children}
    </ListItem>
  );
}
