import React from "react";
import InspectionGraph from "./InspectionGraph";
import styled from "styled-components";

const InspectionStateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  background-color: #282943;
  border-radius: 10px;
  padding: 25px;
  h3 {
    font-size: 20px;
    font-weight: 700;
  }
  p {
    font-size: 12px;
    font-weight: 400;
    color: #b6b5c5;
  }
  span {
    font-weight: 700;
    color: #ffffff;
  }
  .inspection-graph-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

export default function InspectionState({ value }) {
  const DataState = {
    total:
      value?.approvedJobCount +
        value?.waitingJobCount +
        value?.rejectedJobCount || 0,
    approved: value?.approvedJobCount || 0,
    waiting: value?.waitingJobCount || 0,
    rejected: value?.rejectedJobCount || 0,
  };
  return (
    <InspectionStateContainer>
      <h3>Inspection status</h3>
      <p>
        from<span>{DataState["total"]}</span> labelled images
      </p>
      <div className="inspection-graph-container">
        <InspectionGraph
          labelled={DataState["total"]}
          value={DataState["waiting"]}
          tag="Awaiting"
        />
        <InspectionGraph
          labelled={DataState["total"]}
          value={DataState["approved"]}
          tag="Completed"
        />
        <InspectionGraph
          labelled={DataState["total"]}
          value={DataState["rejected"]}
          tag="Rejected"
        />
      </div>
    </InspectionStateContainer>
  );
}
