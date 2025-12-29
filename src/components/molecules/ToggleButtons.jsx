import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  background-color: #282943;
  border-radius: 5px;
  padding: 3px;
  button {
    display: flex;
    font-size: 15px;
    font-weight: 600;
    align-items: center;
    justify-content: center;
    height: 90%;
    width: 50%;
    background-color: #282943;
    border: none;
    cursor: pointer;
    color: #f62579;
    transition: all 0.2s ease;
    svg {
      width: 20px;
      height: 20px;
    }
  }
  .active {
    border-radius: 5px;
    background-color: #f62579;
    color: #ffffff;
    box-shadow: 0 0 10px 0 rgba(246, 37, 121, 0.5);
  }
`;
export default function ToggleButtons({ name, currentValue, onChange }) {
  return (
    <Container>
      {name.map((item, index) => (
        <button
          key={index}
          onClick={() => onChange?.(item.title)}
          className={currentValue === item.title ? "active" : ""}
        >
          {item.icon ? item.icon : item.title}
        </button>
      ))}
    </Container>
  );
}
