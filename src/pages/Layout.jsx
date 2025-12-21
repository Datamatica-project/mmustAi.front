import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Gnb from "../components/organisms/Gnb";
import styled from "styled-components";
import { useAuthStore } from "../store/authStore";

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
  const { token } = useAuthStore();

  // 로그인 페이지가 아닌데 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

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
