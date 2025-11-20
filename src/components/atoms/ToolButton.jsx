import React from "react";
import styled from "styled-components";
import { Button } from "../../styles/common";

export default function ToolButton({ active, onClick, children }) {
  return (
    <Button
      onClick={onClick}
      className={`tool-button ${active ? "active" : ""}`}
    >
      {children}
    </Button>
  );
}
