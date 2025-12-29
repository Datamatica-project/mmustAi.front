import React from "react";
import styled from "styled-components";
import logoPng from "../../assets/image/datamatica_Logo.png";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Nav = styled.nav`
  position: fixed;
  z-index: 800;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 30px 20px;
  background-color: #2f304e;
  gap: 30px;
  a {
    margin: 0 auto;
  }
  .logout-container {
    margin-top: auto;
  }
  ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: center;
    font-size: 15px;
    font-weight: 400;
  }

  & .active {
    border-bottom: 2px solid #ea257f;
    font-weight: 700;
  }
`;

const NavLinks = styled(NavLink)`
  box-sizing: border-box;
  width: 100px;
  color: #fff;
  padding: 10px;
  text-decoration: none;
  display: block;
  border-bottom: 2px solid rgba(255, 255, 255, 0.14);

  &:hover {
    background: #ffffff1c;
    border-radius: 5px;
  }

  &.logout-button {
    font-weight: 700;
    border-bottom: 2px solid #ea257f;
  }
`;

const GoBackButton = styled(NavLinks)`
  font-weight: 700;
  border-bottom: 2px solid #ea257f;
`;

export default function Gnb() {
  const navigate = useNavigate();
  const { clearToken } = useAuthStore();
  const params = useParams();

  const handleLogout = (e) => {
    e.preventDefault();
    // 1. 토큰 삭제 (Zustand 상태 + localStorage)
    clearToken();
    // 2. 로그인 페이지로 이동
    navigate("/login");
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    console.log(params);
    if (params.jobId) {
      navigate(`/project/${params.projectId}/task/${params.taskId}`);
    } else if (!params.jobId && params.taskId) {
      navigate(`/project/${params.projectId}`);
    } else if (!params.jobId && !params.taskId && params.projectId) {
      navigate(`/`);
    }
  };

  return (
    <Nav>
      <Link to="/login">
        <img src={logoPng} alt="logo" width={70} height={70} />
      </Link>
      <ul>
        {window.location.pathname !== "/" && (
          <li>
            <GoBackButton onClick={handleGoBack}>go back</GoBackButton>
          </li>
        )}
        <li>
          <NavLinks to="/">Home</NavLinks>
        </li>
      </ul>

      <ul className="logout-container">
        <li>
          <NavLinks
            to="/login"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </NavLinks>
        </li>
      </ul>
    </Nav>
  );
}
