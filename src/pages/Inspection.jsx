import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import InspectionWorkspace from "../components/organisms/InspectionWorkspace";
import { getJob } from "../api/Job";
import { useParams } from "react-router-dom";
import { getFileUrlByName } from "../api/File";
import {
  useClassStore,
  uselabelDataFlagStore,
  useObjectStore,
} from "../store/bboxStore";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export default function Inspection() {
  const { jobId, fileName } = useParams();
  const [jobData, setJobData] = useState({});
  const [imageUrl, setImageUrl] = useState(null);
  const { setLabelInfos } = useClassStore();
  const { labelDataFlag, setLabelDataFlag } = uselabelDataFlagStore();
  const { objectsStore, setObjectsStore } = useObjectStore();

  useEffect(() => {
    const fetchJob = async () => {
      const response = await getJob(jobId);
      setJobData(response.data);
      const allObjects = response.data.labelInfos
        .filter((labelInfo) => labelInfo.objectInfos?.length > 0)
        .flatMap((labelInfo) => labelInfo.objectInfos);

      setObjectsStore(allObjects);

      setLabelInfos(response.data.labelInfos);
    };
    fetchJob();
  }, [jobId, labelDataFlag]);

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
      <PageHeader title={jobData?.fileName} description={jobData?.status} />
      <InspectionWorkspace imageUrl={imageUrl} jobData={jobData} />
    </Container>
  );
}
