import React from "react";
import styled from "styled-components";

const BaseCardContainer = styled.div`
  background-color: #1c1e33;
  border-radius: 10px;
  display: flex;
  &.top-summary-card {
    padding: 20px;
    align-items: center;
    justify-content: space-between;

    .total-image__icon {
      svg {
        width: 58px;
        height: 58px;
      }
    }
  }

  &.status-card {
    flex-direction: column;
    padding: 12px 17px;

    .status-card__status {
      font-size: 15px;
      font-weight: 400;
      color: #b6b5c5;
      margin-bottom: 10px;
    }
  }
`;

export default function BaseCard({ children, className }) {
  return (
    <BaseCardContainer className={`base-card ${className}`}>
      {children}
    </BaseCardContainer>
  );
}
