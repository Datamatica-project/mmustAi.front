import React from "react";
import { NoticeIcon } from "../icons/Project";
import styled from "styled-components";

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;

  svg {
    color: #484a60;
    width: 25px;
    height: 25px;
  }
  &:hover {
    svg {
      color: #f4c37e;
    }
  }
`;

export default function NoticeBTN({ onClick }) {
  return <Button onClick={onClick}>{NoticeIcon}</Button>;
}
