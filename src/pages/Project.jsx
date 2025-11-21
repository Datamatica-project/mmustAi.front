import React, { useState } from "react";
import styled from "styled-components";
import ChartBlock from "../components/molecules/ChartBlock";
import InspectionState from "../components/molecules/InspectionState";
import Workload from "../components/molecules/Workload";
import BestWorker from "../components/molecules/BestWorker";
import CompleteImage from "../components/molecules/CompleteImage";
import TaskTable from "../components/molecules/TaskTable";
import { data, peopleCost, TaskList } from "../data";
import Pagination from "../components/common/Pagination";
import { Link, useParams } from "react-router-dom";

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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const params = useParams();

  // 페이지네이션 데이터 추출 (0, 10), (10, 20), (20, 30), ...
  const paginateDate = TaskList.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main>
      <Header>
        <div>
          <Title>{data.name}</Title>
          <Description>{data.description}</Description>
        </div>
        <div className="button-group">
          <button className="button">Auto Labeling</button>
          <StyledLink to="/synthetic-data" className="button">
            Synthetic Data
          </StyledLink>
        </div>
      </Header>
      <Overview>
        <h2>overview</h2>
        <div className="dataBlockContainer">
          <section className="left">
            <CompleteImage data={data} />
          </section>

          <section className="center">
            <div>
              <ChartBlock value={data.total} label="total images" />
              <ChartBlock value={data.labelled} label="Labelled images" />
              <ChartBlock value={data.unlabelled} label="Unlabelled images" />
            </div>

            <div>
              <InspectionState value={data} />
              <Workload value={data} />
            </div>
          </section>

          <section className="right">
            <BestWorker value={peopleCost} />
          </section>
        </div>
      </Overview>
      <TaskContainer>
        <h2>Task list</h2>
        <TaskTable
          value={paginateDate}
          page={page}
          pageSize={pageSize}
          projectId={params.projectId}
        />
        <Pagination
          total={TaskList.length}
          page={page}
          pageSize={pageSize}
          onChange={setPage}
        />
      </TaskContainer>
    </main>
  );
}
