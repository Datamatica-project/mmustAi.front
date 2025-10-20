import React, { useState } from "react";
import ToolButton from "../atoms/ToolButton";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 16px;
`;
export default function ToolSelector({ options, currentValue, onChange }) {
  return (
    <Container>
      {options.map((opt) => (
        <ToolButton
          key={opt.id}
          active={currentValue === opt.id}
          onClick={() => onChange(opt.id)}
          icon={opt.icon}
          title={opt.label}
        />
      ))}
    </Container>
  );
}
