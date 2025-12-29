import React from "react";
import styled from "styled-components";
import { DashIcon, PlusIcon } from "../icons/Project";

const Container = styled.div`
  width: 130px;
  background-color: #1c1d2f;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(54, 55, 81, 0.42);

  button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #363751;
    width: 30px;
    height: 30px;
    border-radius: 2px;
    svg {
      width: 15px;
      height: 15px;
      color: #ffffff;
    }
  }

  input {
    width: 100%;
    flex: 1;
    color: #ffffff;
    text-align: center;
    font-size: 15px;
    font-weight: 700;

    background-color: transparent;
    border: none;
    outline: none;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &[type="number"] {
      -moz-appearance: textfield;
    }
  }
`;

export default function CountButtonBox({
  count,
  setCount,
  min = 0,
  max = 100,
}) {
  const handleDecrease = () => {
    setCount(count - 1);
  };
  const handleIncrease = () => {
    setCount(count + 1);
  };
  const handleChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setCount(value);
  };
  return (
    <Container>
      <button onClick={handleDecrease}>{DashIcon}</button>
      <input type="number" value={count} onChange={handleChange} />

      <button onClick={handleIncrease}>{PlusIcon}</button>
    </Container>
  );
}
