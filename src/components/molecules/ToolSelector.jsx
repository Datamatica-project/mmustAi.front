import React, { useState } from "react";
import ToolButton from "../atoms/ToolButton";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 16px;
`;

export default function ToolSelector({ buttons, currentValue, onChange }) {
  return (
    <Container>
      {buttons.map((button) => (
        <ToolButton
          key={button.title}
          active={currentValue === button.title}
          onClick={() => onChange?.(button.title)}
        >
          {button.icon}
          {button.title}
        </ToolButton>
      ))}
    </Container>
  );
}
