import React from "react";
import styled from "styled-components";
import { UserIcon } from "../icons/Icons";

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

export default function UserInfo({ userName = "John Doe" }) {
  return (
    <Container>
      {UserIcon}
      <div className="user-info-container">
        <h3 className="user-info-title">worker</h3>
        <span className="user-info-name">{userName}</span>
      </div>
    </Container>
  );
}
