import React, { useState } from "react";
import styled from "styled-components";
import UserInfo from "../molecules/UserInfo";
import InspectorButton from "../molecules/InspectorButton";
import ListSection from "../molecules/ListSection";
import ClassLabel from "../atoms/ClassLabel";
import { classes, objects } from "../../data";
import NoticeBTN from "../atoms/NoticeBTN";
import FeedBackModal from "../common/FeedBackModal";
import { LeftArrowIcon, RightArrowIcon } from "../icons/Icons";

const Section = styled.section`
  justify-content: center;
  display: flex;
  flex-direction: row;
  gap: 50px;
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

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function InspectionWorkspace() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);

  const handleClick = (title) => {
    console.log(title);
  };

  const handleNoticeClick = (id) => {
    setIsModalOpen(true);
    setSelectedButton(id);
  };
  return (
    <Section>
      {/* 왼쪽 사이드바 */}
      <Aside>
        <UserInfo role="Inspector" userName="John Doe" />
        <InspectorButton handleClick={handleClick} />

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

        {/* 객체 목록 */}
        <ListSection title={"Objects"}>
          {objects.map((obj) => (
            <ClassLabel
              key={obj.id}
              type="Object"
              color={obj.color}
              name={obj.name}
            >
              <NoticeBTN onClick={() => handleNoticeClick(obj.id)} />
            </ClassLabel>
          ))}
        </ListSection>
        {isModalOpen && (
          <FeedBackModal
            selectedButton={selectedButton}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedButton(null);
            }}
          />
        )}
      </Aside>
      <main>
        {/* 헤더 */}
        <Header>
          <div className="file-info">
            <h3>Image001.jpg</h3>
            <p>Not reviewed</p>
          </div>
        </Header>
        <ImageContainer className="image-container">
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
