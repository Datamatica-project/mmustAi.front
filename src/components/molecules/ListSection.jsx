import React from "react";
import styled from "styled-components";

const Container = styled.div`
  .title {
    font-size: 18px;
    font-weight: 700;
  }

  .List {
    padding: 30px 0 0 15px;
  }
`;

export default function ListSection({ title, children }) {
  return (
    <Container>
      <h3 className="title">{title}</h3>
      <ul className="List">{children}</ul>
    </Container>
  );
}
