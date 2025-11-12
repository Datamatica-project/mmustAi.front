import React from "react";
import styled from "styled-components";
import UserInfo from "../molecules/UserInfo";
import ToolSelector from "../molecules/ToolSelector";
import { inspectionOptions } from "../../data";

const Section = styled.section`
  display: flex;
  flex-direction: row;
  gap: 50px;
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function InspectionWorkspace() {
  return (
    <Section>
      {/* 왼쪽 사이드바 */}
      <Aside>
        <UserInfo role="Inspector" userName="John Doe" />
        <ToolSelector options={inspectionOptions} />
      </Aside>
      <main></main>
    </Section>
  );
}
