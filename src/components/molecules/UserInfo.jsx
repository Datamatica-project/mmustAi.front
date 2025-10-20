import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .user-info-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .user-info-title {
    font-size: 14px;
    font-weight: 800;
    color: #9c9ec9;
  }

  .user-info-name {
    font-size: 15px;
    font-weight: 800;
  }
`;

const userIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="35"
    height="35"
    fill="currentColor"
    className="bi bi-person"
    viewBox="0 0 16 16"
  >
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
  </svg>
);

export default function UserInfo({ userName = "John Doe" }) {
  return (
    <Container>
      {userIcon}
      <div className="user-info-container">
        <h3 className="user-info-title">worker</h3>
        <span className="user-info-name">{userName}</span>
      </div>
    </Container>
  );
}
