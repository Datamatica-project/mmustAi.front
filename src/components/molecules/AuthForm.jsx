import React from "react";
import styled from "styled-components";

const LoginButton = styled.button`
  overflow: hidden;
  transition-duration: 400ms;
  padding: 13px 54px;
  background-color: #ea257f;
  color: #ffffff;
  border: none;
  border-radius: 20px;

  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &.show {
    border-radius: 12px;
  }

  @media (max-width: 375px) {
    padding: 11px 40px;
    font-size: 14px;
  }
`;

const InputSection = styled.section`
  overflow: hidden;
  height: 0;
  margin-bottom: 0px;
  transition-duration: 400ms;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  .input {
    margin-top: 1px;
    font-size: 15px;
    font-weight: 500;
    width: 100%;
    max-width: 350px;
    padding: 10px 20px;
    border: 1px solid #ea257f;
    border-radius: 20px;
    background-color: transparent;
    color: #ffffff;
    box-sizing: border-box;
  }
  .input::placeholder {
    color: #7c7e9c;
  }

  &.show {
    height: 100px;
    margin-bottom: 30px;
  }

  @media (max-width: 375px) {
    gap: 12px;

    .input {
      font-size: 14px;
      padding: 9px 16px;
      max-width: 100%;
    }

    &.show {
      height: 90px;
      margin-bottom: 25px;
    }
  }
`;

export default function AuthForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  expanded,
}) {
  return (
    <form onSubmit={onSubmit}>
      <InputSection className={expanded ? "show" : ""}>
        <input
          type="email"
          placeholder="Email"
          aria-label="이메일 주소"
          className="input"
          value={email}
          onChange={onEmailChange}
        />
        <input
          type="password"
          placeholder="Password"
          aria-label="비밀번호"
          className="input"
          value={password}
          onChange={onPasswordChange}
        />
      </InputSection>

      <LoginButton className={expanded ? "show" : ""} type="submit">
        Login
      </LoginButton>
    </form>
  );
}
