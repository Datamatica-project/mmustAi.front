import React from "react";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import PageHeader from "../components/organisms/PageHeader";
import LabelingWorkspace from "../components/organisms/LabelingWorkspace";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export default function Labeling() {
  const location = useLocation();
  const { fileName, fileId } = useParams();
  const title = fileName || "Task 1";
  const description = "Project_1";

  return (
    <Container>
      <PageHeader title={title} description={description} />
      <LabelingWorkspace fileId={fileId} fileName={fileName} />
    </Container>
  );
}
