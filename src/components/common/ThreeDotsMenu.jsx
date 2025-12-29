import React from "react";
import { ThreeDotsMenuIcon } from "../icons/Icons";
import styled from "styled-components";

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  svg {
    color: white;
    width: 20px;
    height: 20px;
  }
`;
export default function ThreeDotsMenu() {
  return <Button>{ThreeDotsMenuIcon}</Button>;
}
