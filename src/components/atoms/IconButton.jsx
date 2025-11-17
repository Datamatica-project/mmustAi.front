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
  padding: 8px 12px;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  font-size: 20px;
  font-weight: 700;
  border-radius: 10px;
`;
export default function IconButton({ icon, onClick, title, to = "/" }) {
  return (
    <Button to={to} onClick={onClick}>
      <div>{icon}</div>
      <span>{title}</span>
    </Button>
  );
}
