import React from "react";
import styled from "styled-components";

const ProgressBarContainer = styled.div`
  max-width: 250px;
  height: 5px;
  width: 100%;

  background-color: #26273d;
  border-radius: 5px;
  .progress-bar-fill {
    height: 100%;
    background-color: #f62579;
    border-radius: 5px;
    width: ${({ $value }) => $value}%;
  }
`;

export default function ProgressBar({ value }) {
  return (
    <ProgressBarContainer $value={value}>
      <div className="progress-bar-fill"></div>
    </ProgressBarContainer>
  );
}
