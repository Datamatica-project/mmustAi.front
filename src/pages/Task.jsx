import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import ImageTable from "../components/molecules/ImageTable";
import TaskInfo from "../components/molecules/TaskInfo";
import { ImageData } from "../data";
import { getTaskImgList, getTaskStatistics } from "../api/Project";
import { getTaskDetail } from "../api/Task";

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
  /**
   *  taskId: 태스크 아이디
   * jobCount: 토탈 이미지,
   * completedJobCount
   * inProgressJobCount
   * waitingJobCount
   * approvedJobCount
   * rejectedJobCount
   */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = useParams();
  const [taskData, setTaskData] = useState(null);
  const [taskImgList, setTaskImgList] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      const detailData = await getTaskDetail(params.taskId);
      console.log(detailData.data);
      const response = await getTaskStatistics(params.taskId);
      setTaskData(response.data);
      setTaskDetail(detailData.data);
    };
    fetchTask();
  }, []);

  useEffect(() => {
    const fetchTaskImgList = async () => {
      const listData = await getTaskImgList(params.taskId);
      setTaskImgList(listData.data);
    };
    fetchTaskImgList();
  }, [params.taskId]);

  return (
    <main>
      <TaskHeader>
        <div className="task-header-wrapper">
          <Title>{taskDetail?.projectInfo?.name}</Title>
          <Description>{taskDetail?.projectInfo?.status}</Description>
        </div>
        <span className="task-total-image">
          {taskDetail?.projectInfo?.taskCount} images
        </span>
      </TaskHeader>
      <TaskContent>
        {taskImgList && (
          <ImageTable
            imageData={taskImgList || []}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
          />
        )}

        <TaskInfo data={taskData} />
      </TaskContent>
    </main>
  );
}
