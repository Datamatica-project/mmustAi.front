import React, { lazy, Suspense, useEffect } from "react";
import styled from "styled-components";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Layout from "../pages/Layout";
import { useAuthStore } from "../store/authStore";
import Project from "../pages/Project";
import Task from "../pages/Task";
import SyntheticData from "../pages/SyntheticData";
import SyntheticLayout from "../pages/SyntheticLayout";
import SyntheticBackground from "../pages/SyntheticBackground";
import DataAugmentation from "../pages/DataAugmentation";

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
const CreateProject = lazy(() => import("../pages/CreateProject"));
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
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/project/:projectId" element={<Project />} />
          <Route path="/project/:projectId/task/:taskId" element={<Task />} />
          <Route
            path="/project/:projectId/task/:taskId/labeling/:jobId"
            element={<Labeling />}
          />
          <Route
            path="/project/:projectId/task/:taskId/reviewing/:jobId"
            element={<Inspection />}
          />
          <Route path="/synthetic-data" element={<SyntheticLayout />}>
            <Route index element={<SyntheticData />} /> {/* 1단계 */}
            <Route path="background" element={<SyntheticBackground />} />
            <Route path="data-augmentation" element={<DataAugmentation />} />
            {/* 2단계 */}
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
