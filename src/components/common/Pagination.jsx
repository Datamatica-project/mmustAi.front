import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/Project";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 50px;

  button {
    color: #a7a7a7;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    width: 35px;
    height: 35px;
    box-sizing: border-box;
    border-radius: 5px;

    font-size: 20px;
    font-weight: 500;
    line-height: 2;
    &:hover {
      background-color: #282943;
    }
    &.active {
      color: #ffffff;
      background-color: #f62579bd;
    }
  }
  .prev,
  .next {
    color: #ffffff;
    svg {
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

export default function Pagination({ total, page, pageSize, onChange }) {
  return (
    <Container>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="prev"
        aria-label="Previous page"
      >
        {ChevronLeftIcon}
      </button>
      {Array.from({ length: Math.ceil(total / pageSize) }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange(index + 1)}
          className={page === index + 1 ? "active" : ""}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === Math.ceil(total / pageSize)}
        className="next"
        aria-label="Next page"
      >
        {ChevronRightIcon}
      </button>
    </Container>
  );
}
