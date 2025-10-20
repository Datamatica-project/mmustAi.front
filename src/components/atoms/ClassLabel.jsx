import React from "react";
import styled from "styled-components";

const ListItem = styled.li`
  background-color: #3b3c5d;
  display: flex;
  align-items: center;
  padding: 13px;
  border-radius: 8px;
  box-sizing: border-box;
  gap: 20px;

  .colorCircle {
    width: 17px;
    height: 17px;
    background-color: rgba(255, 0, 0, 1);
    border: 1px solid rgba(255, 255, 255, 0.36);
    box-shadow: 0px 0px 5.2px 3px rgba(255, 0, 0, 0.25);
    border-radius: 50%;
  }

  .Wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 5px;
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
`;

export default function ClassLabel() {
  return (
    <ListItem>
      <div className="colorCircle" />
      <div className="Wrapper">
        <h4>Class</h4>
        <span>People</span>
      </div>
    </ListItem>
  );
}
