import React from "react";
import styled from "styled-components";

const BestWorkerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }
  span {
    font-size: 20px;
    font-weight: 500;
  }
`;

const List = styled.ul`
  height: 400px;
  overflow: auto;
  display: flex;
  scrollbar-width: none;
  flex-direction: column;
  gap: 45px;
  .bestWorker__item {
    height: 25%;
    display: flex;
    gap: 13px;
    .bestWorker__number {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: #b6b5c5;
      width: 50px;
      border-radius: 10px;
      background-color: #282943;
    }
  }

  .bestWorker__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 13px;
    p:first-child {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
    }
    p:last-child {
      font-size: 14px;
      font-weight: 400;
      color: #b6b5c5;
      display: flex;
      justify-content: space-between;
    }
  }
`;

export default function BestWorker({ value }) {
  console.log(value);
  return (
    <BestWorkerContainer>
      <Header>
        <h3>Best Worker</h3>
        <span>total {value?.totalCount || 0}</span>
      </Header>
      <List>
        {value?.bestWorkers?.map((item, index) => (
          <li className="bestWorker__item" key={index}>
            <span className="bestWorker__number">{item.rank}</span>
            <div className="bestWorker__info">
              <p>{item.worker}</p>
              <p>
                <span>{item.completedJobsCount} images</span>
              </p>
            </div>
          </li>
        ))}
      </List>
    </BestWorkerContainer>
  );
}
