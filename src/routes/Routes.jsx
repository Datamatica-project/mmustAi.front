import React, { lazy, Suspense } from "react";
import styled from "styled-components";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";
import Layout from "../pages/Layout";
import Labeling from "../pages/Labeling";

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
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" index element={<Home />} />
        <Route path="/labeling" element={<Labeling />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default Router;
