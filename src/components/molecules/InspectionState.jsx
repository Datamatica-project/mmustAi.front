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
  return (
    <InspectionStateContainer>
      <h3>Inspection status</h3>
      <p>
        from<span>{value.labelled}</span> labelled images
      </p>
      <div className="inspection-graph-container">
        <InspectionGraph
          labelled={value.labelled}
          value={value.watingReview}
          tag="Awaiting"
        />
        <InspectionGraph
          labelled={value.labelled}
          value={value.completed}
          tag="Completed"
        />
        <InspectionGraph
          labelled={value.labelled}
          value={value.rejected}
          tag="Rejected"
        />
      </div>
    </InspectionStateContainer>
  );
}
