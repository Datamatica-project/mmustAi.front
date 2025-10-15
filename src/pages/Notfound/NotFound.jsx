import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 50px;
  color: #c2c2c2;
  font-weight: 600;
`;

export default function NotFound() {
  return (
    <Container>
      <Title>404 NotFound</Title>
    </Container>
  );
}
