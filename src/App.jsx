import { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import Routes from "./routes/Routes";
import { useGetRefreshToken } from "./hooks/useUser";
import { useAuthStore } from "./store/authStore";
function App() {
  const { token, setToken } = useAuthStore();
  const { data } = useGetRefreshToken({ enabled: !token });
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.data?.accessToken) {
      setToken(data.data.accessToken);
    } else {
      navigate("/login");
    }
  }, [data, setToken]);
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}

export default App;
