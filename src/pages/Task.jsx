import React from "react";
import styled from "styled-components";
import ImageTable from "../components/molecules/ImageTable";
import TaskInfo from "../components/molecules/TaskInfo";
import { ImageData } from "../data";

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #9c9ec9;
`;

const TaskHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 10px;
  .task-header-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }
  .task-total-image {
    font-size: 20px;
    font-weight: 400;
    color: #b6b5c5;
  }
`;

const TaskContent = styled.div`
  display: flex;
  gap: 120px;
  width: 100%;
`;

export default function Task() {
  const TaskData = {
    name: "Task 1",
    projectName: "Project 1",
    total: 100,
    completed: 90,
  };

  return (
    <main>
      <TaskHeader>
        <div className="task-header-wrapper">
          <Title>{TaskData.name}</Title>
          <Description>{TaskData.projectName}</Description>
        </div>
        <span className="task-total-image">{TaskData.total} images</span>
      </TaskHeader>
      <TaskContent>
        <ImageTable imageData={ImageData} />
        <TaskInfo data={TaskData} />
      </TaskContent>
    </main>
  );
}
