import React from "react";
import styled from "styled-components";
import Taglabel from "../atoms/Taglabel";
import { Link } from "react-router-dom";
import { deleteProjectFile } from "../../api/Project";
import { useToastStore } from "../../store/toastStore";
import DotMenuButton from "./DotMenuButton";

const Card = styled(Link)`
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  gap: 20px;
  flex-direction: column;
  padding: 35px;
  background-color: #21213d;
  border-radius: 15px;

  &.expired {
    opacity: 0.5;
  }
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .project-info {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
  }
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 10px;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
  p {
    font-size: 15px;
    color: #a7a7a7;
    font-weight: 400;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .role-container {
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    .role {
      font-weight: 700;
      color: #f62579;
    }
    .date {
      font-size: 15px;
      color: #a7a7a7;
      font-weight: 400;
    }
  }
`;
const CardBody = styled.div`
  display: flex;
  gap: 30px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  .progress-bar-container {
    width: 100%;
  }
  .progress-bar-text {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span:first-child {
      font-size: 15px;
      font-weight: 500;
      color: #b6b5c5;
    }
    span:last-child {
      font-size: 12px;
      font-weight: 500;
      color: #ffffff;
    }
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    border-radius: 5px;
    background-color: #30324e;
    position: relative;
  }
  .progress-bar-fill {
    transition: width 0.3s ease-in-out;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(135deg, #f4c37e 0%, #f4c37e 100%);
    box-shadow: 0 0 10px 3px rgba(244, 195, 126, 0.25);
    width: ${({ $width }) => `${$width || 0}%`};
  }

  .Tags-container {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const DotMenuButtonContainer = styled.div`
  position: relative;
  top: 0px;
  right: 0px;
`;

// 남은 날짜 표시용 스타일드 컴포넌트 - 임박 경고를 위한 색상 변경 기능 포함
const RemainingDays = styled.span`
  font-size: 14px;
  font-weight: 600; // 날짜 범위보다 더 굵게 표시하여 중요도 강조
  padding: 4px 10px;
  border-radius: 6px;
  // 남은 날짜에 따라 색상 변경: 7일 이하(빨강), 30일 이하(주황), 그 외(청록)
  color: ${(props) => {
    if (props.$remainingDays <= 7) return "#FF6B6B"; // 1주일 이하 - 경고 빨강
    if (props.$remainingDays <= 30) return "#FFA500"; // 1개월 이하 - 주의 주황
    return "#4ECDC4"; // 여유 있음 - 청록
  }};
  background-color: ${(props) => {
    if (props.$remainingDays <= 7) return "rgba(255, 107, 107, 0.15)"; // 빨강 배경
    if (props.$remainingDays <= 30) return "rgba(255, 165, 0, 0.15)"; // 주황 배경
    return "rgba(78, 205, 196, 0.15)"; // 청록 배경
  }};
  transition: all 0.2s ease-in-out; // 색상 변경 시 부드러운 전환 효과
`;

export default function ProjectCard({ project, onDelete }) {
  const TagColors = {
    tree: "#243447",
    person: "#1F3B2F",
    plant: "#5A3D2B",
    car: "#3A245D",
    animal: "#394B63",
    ect1: "#1C1A1E",
    ect2: "#595963",
    ect3: "#6B4B32",
    ect4: "#18392B",
  };
  const RoleColors = {
    PM: "#F62579",
    Labeler: "#219EBC  ",
    REVIEWER: "#06A77D ",
    SDO: "#7209B7 ",
  };

  const RoleMapping = {
    PROJECT_MANAGER: "PM",
    WORKER: "Labeler",
    REVIEWER: "REVIEWER",
  };

  // 만료된 프로젝트 카드 클릭 시 링크 이동 막고 토스트만 표시
  const handleExpiredCardClick = (e) => {
    if (project.expired) {
      e.preventDefault(); // 링크 이동 방지
      useToastStore.getState().addToast("This project has expired.", "error");
    }
  };

  const handleDeleteClick = async (e) => {
    e.preventDefault(); // 카드(Link) 클릭으로 페이지 이동 막기
    e.stopPropagation();

    try {
      const res = await deleteProjectFile(project.id);

      // 백엔드 응답 구조에 따라 조건 체크
      if (!res.resultCode || res.resultCode === "SUCCESS") {
        // 상위에서 리스트 갱신하도록 콜백 호출
        onDelete();

        useToastStore.getState().addToast("Project delete success.", "success");
      } else {
        console.error("Delete failed:", res);
        useToastStore.getState().addToast("Project delete failed.", "error");
      }
    } catch (err) {
      console.error(err);
      useToastStore.getState().addToast("Project delete error.", "error");
    }
  };

  return (
    <Card
      to={`/project/${project.id}`}
      className={`${project.expired ? "expired" : ""}`}
      onClick={handleExpiredCardClick}
    >
      <CardHeader>
        <div className="project-info">
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
        <div className="role-container">
          <span className="date">
            {project.createdAt.split("T")[0]} ~{" "}
            {project.expiredAt.split("T")[0]}
          </span>

          <Taglabel
            label={RoleMapping[project.role] || "PM"}
            color={RoleColors[RoleMapping[project.role]] || "#3A245D"}
          />
          {/* 남은 날짜 표시 - 시각적 강조 및 임박 경고 색상 적용 */}
          <RemainingDays $remainingDays={project.remainingDays}>
            D-{project.remainingDays}
          </RemainingDays>
        </div>
        <DotMenuButton
          // handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
        />
      </CardHeader>
      <CardBody>
        <div className="progress-bar-container">
          <div className="progress-bar-text">
            <span>Task Progress</span>
            <span>{Math.round(project.totalProgressRate)}% Completed</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${project.totalProgressRate}%` }}
            ></div>
          </div>
        </div>
        <div className="Tags-container">
          {project.labelInfos?.map((tag, index) => (
            <Taglabel
              key={index}
              label={tag.name}
              color={TagColors[tag.hexColor] || tag.hexColor || "#3A245D"}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
