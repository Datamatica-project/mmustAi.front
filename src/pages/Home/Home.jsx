import React, { useState } from "react";
import styled from "styled-components";
import {
  SuitCaseIcon,
  PersonSquareIcon,
  TagsIcon,
  Clipboard2CheckIcon,
  RobotIcon,
  JournalBookmarkIcon,
  SearchIcon,
} from "../../components/icons/HomeIcons";
import IconButton from "../../components/atoms/IconButton";
import ProjectCard from "../../components/molecules/ProjectCard";

// Todo: 프로젝트 데이터 받아오기, map 함수로 교체하여 사용하기

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1c1d2f;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  line-height: 2;
`;

const Description = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #a7a7a7;
  margin-bottom: 24px;
`;

const TabList = styled.ul`
  display: flex;
  gap: 24px;

  li.active > button {
    color: #ffffff;
  }

  li > button {
    background-color: transparent;
    border: none;
    cursor: pointer;

    padding: 10px 0;
    font-size: 20px;
    font-weight: 700;
    color: #4f5973;
    display: flex;
    align-items: center;
    gap: 10px;
    transition-duration: 500ms;

    &:hover {
      color: #ffffff;
    }
  }
`;

const Icon = styled.div`
  width: 20px;
  height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 20px;
    height: 20px;
    color: inherit;
  }
`;

const ActionBar = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const SearchInput = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #626d89;
  }

  .search-input {
    width: 100%;
    max-width: 300px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #434c63;
    border-radius: 4px;

    /* border-radius: 10px; */
    /* background-color: #2c2d3f; */
    background-color: transparent;
    color: #ffffff;
    font-size: 16px;
    padding-left: 35px;
    outline: none;

    &:focus {
      border: 1px solid #f62579;
    }

    &::placeholder {
      color: #626d89;
    }
  }
`;

const Main = styled.main`
  margin-top: 50px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

export default function Home() {
  const [selectTab, setSelectTab] = useState(0);
  const [search, setSearch] = useState("");
  const TabTitles = [
    "All Projects",
    "ProjectManager",
    "Labeler",
    "Reviewer",
    "Synthetic Data Operator",
  ];
  const TabIcons = [
    SuitCaseIcon,
    PersonSquareIcon,
    TagsIcon,
    Clipboard2CheckIcon,
    RobotIcon,
  ];

  return (
    <Container>
      <header>
        <Title>Project</Title>
        <Description>You can check the progress of all projects</Description>
        <TabList>
          {TabTitles.map((title, index) => (
            <li key={index} className={selectTab === index ? "active" : ""}>
              <button onClick={() => setSelectTab(index)}>
                <Icon>{TabIcons[index]}</Icon>
                <span>{title}</span>
              </button>
            </li>
          ))}
        </TabList>
        <ActionBar>
          <SearchInput>
            {SearchIcon}
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </SearchInput>
          <IconButton
            icon={JournalBookmarkIcon}
            onClick={() => {}}
            title="New"
          />
        </ActionBar>
      </header>
      <Main>
        <ProjectCard
          title="Project_1"
          description="Project Description"
          role="Labeler"
          date="2025-08-01"
          progress="70"
          tags={["tree", "person", "plant"]}
        />
      </Main>
    </Container>
  );
}
