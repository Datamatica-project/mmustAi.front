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
    cursor: pointer;
    justify-content: space-between;
    align-items: center;
  }

  .List {
    box-sizing: border-box;
    max-height: ${(props) => (props.$isOpen ? "200px" : "0")};
    overflow-y: auto;
    transition: max-height 0.3s ease-in-out;
    scrollbar-width: thin;
  }
`;

export default function ListSection({ title, children, isOpen, onToggle }) {
  return (
    <Container $isOpen={isOpen}>
      <h3 className="title" onClick={onToggle}>
        {title}
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
      </h3>
      <ul className="List">{children}</ul>
    </Container>
  );
}
