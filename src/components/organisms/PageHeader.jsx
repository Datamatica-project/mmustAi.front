import React from "react";
import styled from "styled-components";

const Container = styled.header`
  display: flex;
  align-items: flex-end;
  gap: 13px;
  h1 {
    font-size: 32px;
    font-weight: 700;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 800px;
  }
  p {
    font-size: 15px;
    font-weight: 700;
    color: #9c9ec9;
  }
`;
export default function PageHeader({ title, description }) {
  return (
    <Container>
      <h1>{title}</h1>
      <p>{description}</p>
    </Container>
  );
}
