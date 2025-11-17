import React, { useState } from "react";
import styled from "styled-components";
import dUrl from "../../assets/svg/D.svg";
import lUrl from "../../assets/svg/L.svg";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../molecules/AuthForm";
import AuthLinks from "../molecules/AuthLinks";
import { usePostLogin } from "../../hooks/useUser";
import { useAuthStore } from "../../store/authStore";

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .d-icon,
  .l-icon {
    position: absolute;
    z-index: -1;
    height: 470px;

    opacity: 0;
    transition-duration: 400ms;
    animation: fadeIn 0.5s ease-out 0.3s forwards;
  }
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  .d-icon {
    bottom: 70px;
    left: 70px;
  }
  .l-icon {
    top: 70px;
    right: 0;
  }

  @media (max-width: 1200px) {
    .d-icon,
    .l-icon {
      height: 300px;
    }
  }
`;

const Main = styled.main`
  text-align: center;
  background-color: #1c1d2fd9;

  .title {
    font-size: 20px;
    font-weight: 500;
    color: #ea257f;
    margin-bottom: 10px;
  }
  .subtitle {
    font-size: 50px;
    font-weight: 700;
    line-height: 60px;
    margin-bottom: 20px;

    & > div:first-of-type {
      margin-bottom: 10px;
    }
    & > div:last-of-type {
      margin-top: 10px;
    }
  }
  .description {
    font-size: 18px;
    font-weight: 500;
    color: #7c7e9c;
    line-height: 1.5;
    margin-bottom: 45px;
  }

  .highlight {
    display: inline-block;
    margin-bottom: 10px;
    position: relative;
    background-color: transparent;

    .bounding-box {
      position: absolute;
      width: 0;
      height: 0;
      z-index: 1;
      animation: expandBox 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes expandBox {
      to {
        width: 100%;
        height: 100%;
      }
    }
    .bounding-box.green {
      animation-delay: 0.4s;
      bottom: 0;
      right: 0;
      background-color: rgba(70, 235, 131, 0.23);
      border: 1px solid #46eb83;
      div {
        border: 1px solid #46eb83;
      }
    }
    .bounding-box.pink {
      animation-delay: 0.2s;
      top: 0;
      left: 0;
      background-color: rgba(234, 37, 127, 0.23);
      border: 1px solid #ea257f;
      div {
        border: 1px solid #ea257f;
      }
    }
    .circle {
      width: 7px;
      height: 7px;
      background-color: #ffffff;
      border-radius: 50%;
      position: absolute;
      z-index: 2;
    }
    .circle.LT {
      top: 0;
      left: 0;
      transform: translate(-50%, -50%);
    }
    .circle.RT {
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    }
    .circle.LB {
      left: 0;
      bottom: 0;
      transform: translate(-50%, 50%);
    }
    .circle.RB {
      right: 0;
      bottom: 0;
      transform: translate(50%, 50%);
    }
  }
`;

// 바운딩 박스 디자인 표현
const PinkCircles = (
  <div className="bounding-box pink">
    <div className="circle LT" />
    <div className="circle RT" />
    <div className="circle LB" />
    <div className="circle RB" />
  </div>
);
const GreenCircles = (
  <div className="bounding-box green">
    <div className="circle LT" />
    <div className="circle RT" />
    <div className="circle LB" />
    <div className="circle RB" />
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState("user1@test.com");
  const [password, setPassword] = useState("Password123!");
  const [showInput, setShowInput] = useState(false);
  const navigate = useNavigate();

  const loginMutation = usePostLogin();
  const { setToken } = useAuthStore();
  const handleLogin = (e) => {
    e.preventDefault();
    if (!showInput) {
      setShowInput(true);
    } else {
      loginMutation.mutate(
        { email, password }, // 로그인 요청 데이터
        {
          // 로그인 성공 시 실행
          onSuccess: (res) => {
            const accessToken = res.data.data.accessToken;
            setToken(accessToken); // 토큰 저장
            navigate("/");
          },
          // 로그인 실패 시 실행
          onError: (error) => {
            console.error(
              "❌ 로그인 실패",
              error.response?.data || error.message
            );
          },
        }
      );
    }
  };
  return (
    <Container>
      <img src={dUrl} alt="D" className="d-icon" />
      <img src={lUrl} alt="L" className="l-icon" />
      <Main>
        <h1 className="title">MmustAI</h1>
        <h2 className="subtitle">
          <div className="highlight pink">{PinkCircles}Label</div> Smarter,
          <br />
          Not <div className="highlight green">{GreenCircles}Harder.</div>
        </h2>
        <p className="description">
          Automatically analyzes images and generates labels, <br />
          allowing you to build datasets quickly with minimal review and edits.
        </p>

        <AuthForm
          email={email}
          password={password}
          onEmailChange={(e) => setEmail(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onSubmit={handleLogin}
          expanded={showInput}
        />

        <AuthLinks expanded={showInput} />
      </Main>
    </Container>
  );
}
