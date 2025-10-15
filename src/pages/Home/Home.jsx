import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1c1d2f;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #ffffff;
`;

export default function Home() {
  return (
    <Container>
      <Title>Home</Title>
    </Container>
  );
}
