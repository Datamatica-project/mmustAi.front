import React from "react";
import BaseCard from "./BaseCard";
import { TotalImageIcon } from "../icons/Project";
import styled from "styled-components";

const TotalImage = styled.div`
  display: flex;
  gap: 5px;
  .total-image__label-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .total-image__total {
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
  }
  .total-image__label {
    color: #b6b5c5;
    font-size: 12px;
    font-weight: 500;
  }

  .total-image__value {
    font-size: 16px;
    color: #30b1ea;
  }
`;

export default function TopSummaryCard({ total }) {
  return (
    <BaseCard className="top-summary-card">
      <TotalImage>
        <div className="total-image__total">{total}</div>
        <div className="total-image__label-wrapper">
          <span className="total-image__label">total image</span>
          <span className="total-image__value">images</span>
        </div>
      </TotalImage>
      <div className="total-image__icon">{TotalImageIcon}</div>
    </BaseCard>
  );
}
