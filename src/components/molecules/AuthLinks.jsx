import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const LinkContainer = styled.div`
  opacity: 0;
  visibility: hidden;
  transition-duration: 400ms;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .link-text {
    color: #ffffff;
    font-size: 14px;
    font-weight: 300;
  }
  &.show {
    opacity: 1;
    visibility: visible;
  }
`;

export default function AuthLinks({ expanded }) {
  return (
    <LinkContainer className={expanded ? "show" : ""}>
      <Link to="/forgot-password" className="forgot-password-link link-text">
        FORGOT YOUR PASSWORD?
      </Link>
      <Link to="/signup" className="create-account-link link-text">
        CREATE AN ACCOUNT
      </Link>
    </LinkContainer>
  );
}
