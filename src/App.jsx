import { useEffect, useRef, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import Routes from "./routes/Routes";
import { useGetRefreshToken } from "./hooks/useUser";
import { useAuthStore } from "./store/authStore";
import ToastContainer from "./components/molecules/ToastContainer";
function App() {
  const { token, setToken, clearToken } = useAuthStore();
  const hasTriedRefresh = useRef(false);

  const { data, isError, isSuccess } = useGetRefreshToken(
    token,
    hasTriedRefresh.current
  );

  useEffect(() => {
    if (!token && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true; // 재실행 방지
    }
  }, [token]);

  // 리프레시 성공 시 토큰 저장
  useEffect(() => {
    if (isSuccess && data) {
      setToken(data.data.accessToken);
    }
  }, [isSuccess, data, setToken]);

  // 리프레시 실패 시 토큰 삭제
  useEffect(() => {
    if (isError) {
      clearToken();
    }
  }, [isError, clearToken]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes isAuthFailed={isError} />
    </BrowserRouter>
  );
}

export default App;
