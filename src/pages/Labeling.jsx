import React from "react";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import LabelingWorkspace from "../components/organisms/LabelingWorkspace";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export default function Labeling() {
  const title = "Task 1";
  const description = "Project_1";

  return (
    <Container>
      {/* 페이지 헤더 */}
      <PageHeader title={title} description={description} />
      {/* 라벨링 작업 공간 */}
      <LabelingWorkspace />
    </Container>
  );
}
