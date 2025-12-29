import React from "react";
import styled from "styled-components";
import { ApproveIcon, RejectIcon } from "../icons/Icons";
import { Button } from "../../styles/common";

const Container = styled.div`
  display: flex;
  gap: 16px;
`;

const Buttons = styled(Button)`
  color: #fff;
  background-color: #3b3c5d;

  &:hover {
    background-color: #464763;
  }
  &.inspector-button.approve > svg {
    color: #46eb83;
  }
  &.inspector-button.reject > svg {
    color: #f44468;
  }
`;

export default function InspectorButton({ handleClick }) {
  const inspectionOptions = [
    { icon: ApproveIcon, title: "Approve" },
    { icon: RejectIcon, title: "Reject" },
  ];

  return (
    <Container>
      {inspectionOptions.map((option) => (
        <Buttons
          key={option.title}
          className={`inspector-button ${option.title.toLowerCase()}`}
          onClick={() => handleClick(option.title)}
        >
          {option.icon}
          {option.title}
        </Buttons>
      ))}
    </Container>
  );
}
