import React from "react";
import styled from "styled-components";

const Badge = styled.span`
  background-color: rgba(244, 195, 126, 0.45);
  display: inline-block;
  padding: 3px 10px;
  box-sizing: border-box;
  border-radius: 12px;

  font-size: 14px;
  font-weight: 400;
  color: white;

  border: 2px solid #f4c37e;

  &.in-progress {
    background-color: rgba(244, 195, 126, 0.45);
    border: 2px solid #f4c37e;
  }
  &.approved {
    background-color: rgba(70, 235, 131, 0.45);
    border: 2px solid #46eb83;
  }
  &.completed {
    background-color: rgba(70, 235, 131, 0.45);
    border: 2px solid #46eb83;
  }
  &.rejected {
    background-color: rgba(244, 68, 104, 0.45);
    border: 2px solid #f44468;
  }
  &.waiting {
    background-color: rgba(163, 126, 244, 0.45);
    border: 2px solid #a37ef4;
  }
`;
export default function StatusBadge({ status }) {
  return <Badge className={`status-badge ${status}`}>{status}</Badge>;
}
