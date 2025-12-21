import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ChartBlock from "../components/molecules/ChartBlock";
import InspectionState from "../components/molecules/InspectionState";
import Workload from "../components/molecules/Workload";
import BestWorker from "../components/molecules/BestWorker";
import CompleteImage from "../components/molecules/CompleteImage";
import TaskTable from "../components/molecules/TaskTable";
import AddImageModal from "../components/molecules/AddImageModal";
import InviteMemberModal from "../components/molecules/InviteMemberModal";
import AutoLabelingModal from "../components/molecules/AutoLabelingModal";
import { peopleCost, TaskList } from "../data";
import Pagination from "../components/common/Pagination";
import { Link, useParams } from "react-router-dom";
import { getBestWorker, getProject, getProjectTasks } from "../api/Project";

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

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;

  .button-group {
    display: flex;
    gap: 10px;
  }
  .button {
    padding: 10px 20px;
    color: white;
    background-color: #282943;
    border: 2px solid #f62579;
    border-radius: 5px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
`;
const StyledLink = styled(Link)`
  text-decoration: none;
  color: white;
`;

const Overview = styled.div`
  width: 1200px;
  h2 {
    font-size: 18px;
    font-weight: 400;
    color: white;
    line-height: 2;
  }
  .dataBlockContainer {
    display: grid;
    grid-template-columns: 0.3fr 0.8fr 0.5fr;
    grid-template-rows: 1fr;
    align-items: stretch;
    gap: 24px;
    width: 100%;
    height: 100%;
  }

  .dataBlock complete {
    border-radius: 10px;
    padding: 30px;
  }
  .left,
  .right {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .center {
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    grid-auto-rows: 1fr;
    align-items: stretch;
    gap: 16px;

    > div {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }
  }
  .dataBlock {
    background-color: #282943;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 15px;
  }
`;

const TaskContainer = styled.div`
  min-height: 900px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 1200px;
  margin-top: 40px;
  padding-bottom: 40px;
  h2 {
    font-size: 20px;
    font-weight: 400;
    color: white;
    line-height: 2;
  }
`;

export default function Project() {
  /**
   * 
  projectId : 프로젝트 ID
  totalTaskCount : 총 태스크 개수 (10개)
  totalJobCount : 총 작업(이미지) 개수 (1000개)
  approvedJobCount : 라벨 완료 + 검수 완료된 총 작업 개수 (500개)
  notApprovedJobCount : 라벨 미완료 + 검수 대기 중 + 검수 결과 탈락처리 된 총 작업 개수
  inProgressJobCount : 라벨 완료 처리 안된 작업 개수 (300개)
  rejectedJobCount : 검수 결과 탈락처리 된 총 작업 개수 (50개)
  waitingJobCount : 검수 대기 중인 총 작업 개수 (150개)
   */
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const params = useParams();
  const [data, setData] = useState(null);
  const [bestWorkerData, setBestWorkerData] = useState(null);
  const [projectTasksData, setProjectTasksData] = useState(null);

  // 모달 상태
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [isAutoLabelingModalOpen, setIsAutoLabelingModalOpen] = useState(false);

  // 페이지네이션 데이터 추출 (0, 10), (10, 20), (20, 30), ...
  const paginateDate = TaskList.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const fetchProject = async () => {
      const response = await getProject(params.projectId);
      const BestWorkerData = await getBestWorker(params.projectId);
      const ProjectTasksData = await getProjectTasks(params.projectId);
      console.log(ProjectTasksData);
      setData(response.data);
      setBestWorkerData(BestWorkerData.data);
      setProjectTasksData(ProjectTasksData.data);
    };
    fetchProject();
  }, []);

  return (
    <main>
      <Header>
        <div>
          <Title>{"Project_1"}</Title>
          <Description>{"This is a description of the project."}</Description>
        </div>
        <div className="button-group">
          <button
            className="button"
            onClick={() => setIsAutoLabelingModalOpen(true)}
          >
            Auto Labeling
          </button>
          <StyledLink to="/synthetic-data" className="button">
            Synthetic Data
          </StyledLink>
          <button
            className="button"
            onClick={() => setIsAddImageModalOpen(true)}
          >
            Add Images
          </button>
          <button
            className="button"
            onClick={() => setIsInviteMemberModalOpen(true)}
          >
            Invite Members
          </button>
        </div>
      </Header>
      <Overview>
        <h2>overview</h2>
        <div className="dataBlockContainer">
          <section className="left">
            {data && <CompleteImage data={data} type="project" />}
          </section>

          <section className="center">
            <div>
              <ChartBlock
                value={data?.totalJobCount || 0}
                label="total images"
              />
              <ChartBlock
                value={data?.totalJobCount - data?.inProgressJobCount || 0}
                label="Labelled images"
              />
              <ChartBlock
                value={data?.inProgressJobCount || 0}
                label="Unlabelled images"
              />
            </div>

            <div>
              <InspectionState value={data} />
              <Workload value={data} />
            </div>
          </section>

          <section className="right">
            <BestWorker value={bestWorkerData} />
          </section>
        </div>
      </Overview>
      <TaskContainer>
        <h2>Task list</h2>
        <TaskTable
          value={projectTasksData}
          page={page}
          pageSize={pageSize}
          projectId={params.projectId}
        />
        <Pagination
          total={projectTasksData?.length || 1}
          page={page}
          pageSize={pageSize}
          onChange={setPage}
        />
      </TaskContainer>

      {/* 이미지 추가 모달 */}
      <AddImageModal
        isOpen={isAddImageModalOpen}
        onClose={() => setIsAddImageModalOpen(false)}
        projectId={params.projectId}
        onUploadComplete={() => {
          // 프로젝트 데이터 새로고침
          const fetchProject = async () => {
            const response = await getProject(params.projectId);
            setData(response.data);
          };
          fetchProject();
        }}
      />

      {/* 팀원 초대 모달 */}
      <InviteMemberModal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        projectId={params.projectId}
        onInviteComplete={() => {
          // 프로젝트 데이터 새로고침
          const fetchProject = async () => {
            const response = await getProject(params.projectId);
            setData(response.data);
          };
          fetchProject();
        }}
      />

      {/* 오토라벨링 모달 */}
      <AutoLabelingModal
        isOpen={isAutoLabelingModalOpen}
        onClose={() => setIsAutoLabelingModalOpen(false)}
        projectId={params.projectId}
        projectData={data}
        onComplete={() => {
          // 프로젝트 데이터 새로고침
          const fetchProject = async () => {
            const response = await getProject(params.projectId);
            setData(response.data);
          };
          fetchProject();
        }}
      />
    </main>
  );
}
