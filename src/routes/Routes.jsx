import React, { lazy, Suspense } from "react";
import styled from "styled-components";
import { Route, Routes } from "react-router-dom";

const Loader = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #ffffff;
`;

// 필요할 때만 로드 되도록 lazy 설정
const Home = lazy(() => import("../pages/Home/Home"));
const NotFound = lazy(() => import("../pages/Notfound/NotFound"));

// 라우터 설정
const Router = () => (
  <Suspense fallback={<Loader>Loading...</Loader>}>
    <Routes>
      {/* 로딩 중일 때 보여줄 UI  */}
      <Route path="/" index element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default Router;
