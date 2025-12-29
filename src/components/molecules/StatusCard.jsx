import React from "react";
import BaseCard from "./BaseCard";
import styled from "styled-components";

const StatusCardCountWrapper = styled.div`
  position: relative;
  .status-card__count {
    padding-left: 20px;
    font-size: 36px;
    font-weight: 400;
    color: #ffffff;
  }

  ::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 5px;
    background-color: ${(props) => {
      const colorMap = {
        "In progress": "#f4c37e",
        Waiting: "#A37EF4",
        Approved: "#46eb83",
        Rejected: "#F44468",
      };
      return colorMap[props.$status] || "#9c9ec9";
    }};
    box-shadow: 0px 0px 10px 3px rgba(255, 255, 255, 0.25);
  }
`;

export default function StatusCard({ status, count }) {
  const countValue = count.toString().padStart(2, "0");
  return (
    <BaseCard className="status-card">
      <span className="status-card__status">{status}</span>
      <StatusCardCountWrapper
        className="status-card__count-wrapper"
        $status={status}
      >
        <span className="status-card__count">{countValue}</span>
      </StatusCardCountWrapper>
    </BaseCard>
  );
}
