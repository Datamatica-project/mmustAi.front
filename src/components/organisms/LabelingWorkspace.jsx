import React, { useState } from "react";
import styled from "styled-components";
import UserInfo from "../molecules/UserInfo";
import ToolSelector from "../molecules/ToolSelector";
import ListSection from "../molecules/ListSection";
import ClassLabel from "../atoms/ClassLabel";
import DotMenuButton from "../molecules/DotMenuButton";
import {
  SaveIcon,
  SubmitIcon,
  LeftArrowIcon,
  RightArrowIcon,
  PolygonIcon,
  BBoxIcon,
} from "../icons/Icons";
import { classes, objects } from "../../data";
import KonvaCanvas from "./KonvaCanvas";

const Section = styled.section`
  display: flex;
  justify-content: center;
  gap: 50px;
`;
const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .file-info {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    h3 {
      font-size: 24px;
      font-weight: 700;
    }
    p {
      font-size: 15px;
      font-weight: 800;
      color: #575871;
    }
  }
  .action-buttons {
    display: flex;
    gap: 10px;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 15px;
      font-weight: 700;
      font-family: inherit;
      color: #fff;
      padding: 5px 12px;
      border-radius: 10px;
      transition-duration: 150ms;
    }
    .save-btn {
      background-color: transparent;
      border: 2px solid #5b5d75;
      cursor: pointer;
      &:hover {
        background-color: #5b5d75;
      }
    }
    .submit-btn {
      background-color: #f62579;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: #e01f6b;
      }
    }
  }
`;
const ImageContainer = styled.div`
  width: 790px;
  height: 600px;
  position: relative;
  margin-bottom: 20px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  button {
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    padding: 5px 12px;
    gap: 11px;
    border: 1px solid #5b5d75;
    color: #fff;
    background-color: transparent;
    cursor: pointer;
    transition-duration: 150ms;

    &:hover {
      background-color: #5b5d75;
    }
  }

  span {
    font-size: 17px;
    font-weight: 700;
    font-family: inherit;
  }
`;

export default function LabelingWorkspace() {
  const [selectButton, setSelectButton] = useState("Polygon");
  const [selectedClass, setSelectedClass] = useState(null);

  const labelingButtonsOptions = [
    { icon: PolygonIcon, title: "Polygon" },
    { icon: BBoxIcon, title: "Bounding Box" },
  ];

  return (
    <Section>
      {/* 왼쪽 사이드바 */}
      <Aside>
        {/* 작업자 정보 */}
        <UserInfo role="Labeler" userName="John Doe" />
        {/* 작업 도구 선택 */}
        <ToolSelector
          buttons={labelingButtonsOptions}
          currentValue={selectButton}
          onChange={setSelectButton}
        />
        {/* 클래스 목록 */}
        <ListSection title={"Classes"}>
          {classes.map((cls) => (
            <ClassLabel
              key={cls.id}
              type="Class"
              color={cls.color}
              name={cls.name}
              isSelected={selectedClass === cls.id}
              onClick={() => setSelectedClass(cls.id)}
            >
              <span className="objectCount">{cls.objectCount}</span>
            </ClassLabel>
          ))}
        </ListSection>

        {/* 클래스별 각 객체 목록 */}
        <ListSection title={"Objects"}>
          {objects.map((obj) => (
            <ClassLabel
              key={obj.id}
              type="Object"
              color={obj.color}
              name={obj.name}
            >
              <DotMenuButton />
            </ClassLabel>
          ))}
        </ListSection>
      </Aside>

      {/* 이미지 영역 */}
      <main>
        {/* 헤더 */}
        <Header>
          <div className="file-info">
            <h3>Image001.jpg</h3>
            <p>1 hour ago</p>
          </div>
          <div className="action-buttons">
            <button className="save-btn">
              {SaveIcon} <span>Save</span>
            </button>
            <button className="submit-btn">{SubmitIcon}Submit</button>
          </div>
        </Header>

        {/* 이미지 컨테이너 */}
        <ImageContainer className="image-container">
          {/* 캔버스 */}
          <KonvaCanvas selectButton={selectButton} classes={classes} />
          <img src="https://picsum.photos/800/600" alt="placeholder" />
        </ImageContainer>

        {/* 하단 네비게이션 */}
        <footer>
          <Navigation>
            <button>{LeftArrowIcon}Prev</button>
            <span>01/10</span>
            <button>{RightArrowIcon}Next</button>
          </Navigation>
        </footer>
      </main>
    </Section>
  );
}
