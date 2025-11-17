import React, { lazy, Suspense, useEffect } from "react";
import styled from "styled-components";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Layout from "../pages/Layout";
import { useAuthStore } from "../store/authStore";
import Project from "../pages/Project";
import Task from "../pages/Task";

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
const Labeling = lazy(() => import("../pages/Labeling"));
const Inspection = lazy(() => import("../pages/Inspection"));
const NotFound = lazy(() => import("../pages/Notfound/NotFound"));

// 라우터 설정
const Router = ({ isAuthFailed }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthFailed) {
      navigate("/login");
    }
  }, [isAuthFailed]);

  return (
    <Suspense fallback={<Loader>Loading...</Loader>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" index element={<Home />} />
          <Route path="/project/:projectId" element={<Project />} />
          <Route path="/project/:projectId/task/:taskId" element={<Task />} />
          <Route path="/labeling" element={<Labeling />} />
          <Route path="/inspection" element={<Inspection />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
