import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import PageHeader from "../components/organisms/PageHeader";
import LabelingWorkspace from "../components/organisms/LabelingWorkspace";
import { getJob } from "../api/Job";
import { useClassStore } from "../store/bboxStore";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export default function Labeling() {
  const location = useLocation();
  const { fileName, fileId, jobId } = useParams();

  const description = "Project_1";
  const [jobData, setJobData] = useState({});
  const { labelInfos, setLabelInfos } = useClassStore();

  useEffect(() => {
    const fetchJob = async () => {
      const response = await getJob(jobId);

      setJobData(response.data);
      setLabelInfos(response.data.labelInfos);
    };
    fetchJob();
  }, [jobId]);

  return (
    <Container>
      <PageHeader title={jobData?.fileName} description={jobData?.status} />
      <LabelingWorkspace
        fileId={fileId}
        fileName={jobData?.fileName}
        jobData={jobData}
      />
    </Container>
  );
}
