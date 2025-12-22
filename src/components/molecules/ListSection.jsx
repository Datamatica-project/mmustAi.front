import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  .title {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .List {
    box-sizing: border-box;
    height: 200px;
    overflow-y: auto;
    transition: max-height 0.3s ease-in-out;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
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
