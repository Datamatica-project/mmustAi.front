import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import PageHeader from "../components/organisms/PageHeader";
import LabelingWorkspace from "../components/organisms/LabelingWorkspace";
import { getJob } from "../api/Job";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export default function Labeling() {
  const location = useLocation();
  const { fileName, fileId, jobId } = useParams();
  const title = fileName || "Task 1";
  const description = "Project_1";
  const [jobData, setJobData] = useState({});

  // 라벨 ID가 없어서 좌표 저장이 불가능한 상황이다.
  useEffect(() => {
    const fetchJob = async () => {
      const response = await getJob(jobId);
      console.log("response", response);
      setJobData(response.data);
    };
    fetchJob();
  }, [jobId]);

  return (
    <Container>
      <PageHeader title={title} description={description} />
      <LabelingWorkspace
        fileId={fileId}
        fileName={fileName}
        jobData={jobData}
      />
    </Container>
  );
}
