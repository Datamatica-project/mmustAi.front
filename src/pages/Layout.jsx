import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Gnb from "../components/organisms/Gnb";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: row; // 가로 배치 (기본값)
  height: 100vh; // 고정 높이
  /* overflow: hidden; */
  padding-left: 135px;
`;

const Main = styled.main`
  width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  .page-container {
    width: 100%;
    padding-top: 70px;
    box-sizing: border-box;
  }
`;

export default function Layout() {
  const location = useLocation();
  // if (location.pathname === "/") {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <Container>
      <Gnb />
      <Main>
        <div className="page-container">
          <Outlet />
        </div>
      </Main>
    </Container>
  );
}
