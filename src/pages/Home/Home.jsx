import React, { useState, useEffect, useMemo } from "react";
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
import { useNavigate } from "react-router-dom";
import { getProjects } from "../../api/Project";
// Todo: 프로젝트 데이터 받아오기, map 함수로 교체하여 사용하기
const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1c1d2f;

  .recent-projects {
    font-size: 17px;
    font-weight: 500;
    color: #ffffff;
    line-height: 2;
  }
`;

const Title = styled.h1`
  font-size: 25px;
  font-weight: 700;
  line-height: 2;
`;

const Description = styled.p`
  font-size: 14px;
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
    font-size: 15px;
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
  gap: 15px;
  border-bottom: 1px solid #313250;
  padding-bottom: 10px;
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
    border-radius: 10px;

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
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

export default function Home() {
  const [selectTab, setSelectTab] = useState(0);
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const TabTitles = [
    "All Projects", // "All"
    "ProjectManager", // "PM"
    "Labeler", // "Labeler"
    "Reviewer", // "Reviewer"
    "Synthetic Data Operator", // "SDO"
  ];
  const TabIcons = [
    SuitCaseIcon,
    PersonSquareIcon,
    TagsIcon,
    Clipboard2CheckIcon,
    RobotIcon,
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await getProjects();

      // 각 프로젝트의 역할을 로컬스토리지에 저장
      // const projectRoles = JSON.parse(
      //   localStorage.getItem("projectRoles") || "{}"
      // );

      setProjects(response.data.items);
      console.log(response.data.items);
    };
    fetchProjects();
  }, [refresh]);

  // 탭과 검색어에 따라 프로젝트 필터링 (useMemo 사용 - 더 효율적)
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // 탭에 따른 필터링
    if (selectTab !== 0) {
      // 0: All Projects - 필터링 없음
      // 1: ProjectManager - role === "PROJECTMANAGER"
      // 2: Labeler - role === "WORKER"
      // 3: Reviewer - role === "REVIEWER"
      // 4: Synthetic Data Operator - role === "SYNTHETIC_DATA_OPERATOR"
      const roleMapping = {
        1: "PROJECTMANAGER",
        2: "WORKER",
        3: "REVIEWER",
        4: "SYNTHETIC_DATA_OPERATOR",
      };

      const targetRole = roleMapping[selectTab];
      if (targetRole) {
        filtered = filtered.filter((project) => project.role === targetRole);
      }
    }

    // 검색어에 따른 필터링
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((project) => {
        // 프로젝트 이름, 설명 등에서 검색
        const nameMatch = project.name?.toLowerCase().includes(searchLower);
        const descMatch = project.description
          ?.toLowerCase()
          .includes(searchLower);
        return nameMatch || descMatch;
      });
    }

    return filtered;
  }, [projects, search, selectTab]);

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
            title="New"
            to="/create-project"
          />
        </ActionBar>
      </header>
      <h2 className="recent-projects">Recent Projects</h2>
      <Main>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={() => setRefresh((prev) => !prev)}
          />
        ))}
      </Main>
    </Container>
  );
}
