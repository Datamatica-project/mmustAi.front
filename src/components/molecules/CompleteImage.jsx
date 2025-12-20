import React from "react";
import DonutChart from "./DonutChart";
import styled from "styled-components";
const CompleteImageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;

  .dataBlock__value {
    font-size: 24px;
    font-weight: 600;
  }
  .dataBlock__label {
    font-size: 16px;
    font-weight: 400;
    color: #a7a7a7;
  }
`;

export default function CompleteImage({ data, type }) {
  let total, approved;

  if (type === "project") {
    total = data.totalJobCount;
    approved = data.approvedJobCount;
  } else {
    total = data.jobCount;
    approved = data.completedJobCount;
  }
  const percentage = approved / total;
  return (
    <CompleteImageContainer className="dataBlock complete">
      <DonutChart $percentage={percentage || 0} />
      <span className="dataBlock__value">{approved || 0} images</span>
      <span className="dataBlock__label">completed</span>
    </CompleteImageContainer>
  );
}
