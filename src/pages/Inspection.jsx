import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import InspectionWorkspace from "../components/organisms/InspectionWorkspace";
import { getJob } from "../api/Job";
import { useParams } from "react-router-dom";
import { getFileUrlByName } from "../api/File";
import { useClassStore } from "../store/bboxStore";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export default function Inspection() {
  const title = "Task 1";
  const description = "Project_1";
  const { jobId, fileName } = useParams();
  const [jobData, setJobData] = useState({});
  const [imageUrl, setImageUrl] = useState(null);
  const { setLabelInfos } = useClassStore();

  useEffect(() => {
    const fetchJob = async () => {
      const response = await getJob(jobId);

      setJobData(response.data);
      setLabelInfos(response.data.labelInfos);
    };
    fetchJob();
  }, [jobId]);

  // 이미지 URL 로드
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (jobData.fileName) {
        // fileName만 있으면 파일명으로 이미지 URL 생성

        const objectUrl = await getFileUrlByName(jobData.fileName);

        setImageUrl(objectUrl);
      } else {
        //없으면 기본 placeholder 이미지
        setImageUrl("https://picsum.photos/800/600");
      }
    };
    fetchImageUrl();
  }, [fileName, jobData]);

  return (
    <Container>
      <PageHeader title={title} description={description} />
      <InspectionWorkspace imageUrl={imageUrl} jobData={jobData} />
    </Container>
  );
}
