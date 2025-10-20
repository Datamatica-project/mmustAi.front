import React, { useState } from "react";
import styled from "styled-components";
import UserInfo from "../molecules/UserInfo";
import ToolSelector from "../molecules/ToolSelector";
import ListSection from "../molecules/ListSection";
import ClassLabel from "../atoms/ClassLabel";

// 버튼 아이콘
const PolygonIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-pentagon"
    viewBox="0 0 16 16"
  >
    <path d="M7.685 1.545a.5.5 0 0 1 .63 0l6.263 5.088a.5.5 0 0 1 .161.539l-2.362 7.479a.5.5 0 0 1-.476.349H4.099a.5.5 0 0 1-.476-.35L1.26 7.173a.5.5 0 0 1 .161-.54l6.263-5.087Zm8.213 5.28a.5.5 0 0 0-.162-.54L8.316.257a.5.5 0 0 0-.631 0L.264 6.286a.5.5 0 0 0-.162.538l2.788 8.827a.5.5 0 0 0 .476.349h9.268a.5.5 0 0 0 .476-.35l2.788-8.826Z" />
  </svg>
);

const BBoxIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-bounding-box-circles"
    viewBox="0 0 16 16"
  >
    <path d="M2 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2M0 2a2 2 0 0 1 3.937-.5h8.126A2 2 0 1 1 14.5 3.937v8.126a2 2 0 1 1-2.437 2.437H3.937A2 2 0 1 1 1.5 12.063V3.937A2 2 0 0 1 0 2m2.5 1.937v8.126c.703.18 1.256.734 1.437 1.437h8.126a2 2 0 0 1 1.437-1.437V3.937A2 2 0 0 1 12.063 2.5H3.937A2 2 0 0 1 2.5 3.937M14 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2M2 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
  </svg>
);

// 스타일
const Section = styled.section`
  display: flex;
  gap: 40px;
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function LabelingWorkspace() {
  const [selectButton, setSelectButton] = useState("Polygon");
  const options = [
    { id: "Polygon", icon: PolygonIcon, label: "Polygon" },
    { id: "Bounding Box", icon: BBoxIcon, label: "Bounding Box" },
  ];

  return (
    <Section>
      <Aside>
        {/* 작업자 정보 */}
        <UserInfo />
        {/* 작업 도구 선택 */}
        <ToolSelector
          options={options}
          currentValue={selectButton}
          onChange={setSelectButton}
        />
        <ListSection title={"Classes"}>
          <ClassLabel />
        </ListSection>
        <ListSection title={"Objects"}></ListSection>
      </Aside>
      <div>main area</div>
    </Section>
  );
}
