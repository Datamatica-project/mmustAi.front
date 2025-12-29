import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  background-color: #f62579;
  border: none;

  display: flex;
  gap: 10px;
  padding: 6px 10px;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  font-size: 15px;
  font-weight: 700;
  border-radius: 10px;
`;
export default function IconButton({ icon, title, to = "/" }) {
  return (
    <Button to={to}>
      <div>{icon}</div>
      <span>{title}</span>
    </Button>
  );
}
