import React from "react";
import styled from "styled-components";
import dUrl from "../../assets/svg/D.svg";
import lUrl from "../../assets/svg/L.svg";

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
    transition-duration: 500ms;
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

  .title {
    font-size: 20px;
    font-weight: 500;
    color: #ea257f;
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

    &.pink {
      background-color: rgba(234, 37, 127, 0.23);
      border: 1px solid #ea257f;
      color: rgba(250, 204, 225, 1);
    }
    &.green {
      background-color: rgba(70, 235, 131, 0.23);
      border: 1px solid #46eb83;
      color: rgba(212, 250, 226, 1);
    }
  }
`;

const LoginButton = styled.button`
  padding: 13px 54px;
  background-color: #ea257f;
  color: #ffffff;
  border: none;
  border-radius: 20px;

  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

export default function Login() {
  return (
    <Container>
      <img src={dUrl} alt="D" className="d-icon" />
      <img src={lUrl} alt="L" className="l-icon" />
      <Main>
        <h1 className="title">MmustAI</h1>
        <h2 className="subtitle">
          <div>
            <span className="highlight pink">Label</span> Smarter,
          </div>
          <div>
            Not <span className="highlight green">Harder.</span>
          </div>
        </h2>
        <p className="description">
          Automatically analyzes images and generates labels, <br />
          allowing you to build datasets quickly with minimal review and edits.
        </p>
        <LoginButton className="login-button">Login</LoginButton>
      </Main>
    </Container>
  );
}
