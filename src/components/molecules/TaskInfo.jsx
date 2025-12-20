import React from "react";
import CompleteImage from "./CompleteImage";
import styled from "styled-components";
import TopSummaryCard from "./TopSummaryCard";
import StatusCard from "./StatusCard";

const TaskInfoContainer = styled.div`
  flex: 1;
  max-width: 460px;
  border-radius: 10px;
  box-sizing: border-box;
  background-color: #282943;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 50px;

  h3 {
    font-size: 20px;
    margin-bottom: 30px;
  }

  .task-info__statistics > div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const StatusGrid = styled.div`
  margin: 0 auto;
  max-width: 325px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  > div:first-child {
    grid-column: 1 / -1;
  }
`;

export default function TaskInfo({ data }) {
  return (
    <TaskInfoContainer>
      <div className="task-info__statistics">
        <h3>Statistics</h3>
        {data && <CompleteImage data={data} type="task" />}
      </div>
      <div>
        <h3>work status</h3>
        <StatusGrid>
          <TopSummaryCard total={data?.jobCount || 0} />
          <StatusCard
            status="In progress"
            count={data?.inProgressJobCount || 0}
          />
          <StatusCard status="Waiting" count={data?.waitingJobCount || 0} />
          <StatusCard status="Approved" count={data?.approvedJobCount || 0} />
          <StatusCard status="Rejected" count={data?.rejectedJobCount || 0} />
        </StatusGrid>
      </div>
    </TaskInfoContainer>
  );
}
