import React from "react";
import styled from "styled-components";
import logoPng from "../../assets/image/datamatica_Logo.png";
import { Link, NavLink } from "react-router-dom";

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 30px 20px;
  background-color: #2f304e;
  gap: 30px;
  a {
    margin: 0 auto;
  }
  ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: center;
    font-size: 15px;
    font-weight: 400;
  }

  & .active {
    border-bottom: 2px solid #ea257f;
    font-weight: 700;
  }
`;

const NavLinks = styled(NavLink)`
  color: #fff;
  padding: 10px;
  text-decoration: none;
  display: block;
  border-bottom: 2px solid rgba(255, 255, 255, 0.14);

  &:hover {
    background: #ffffff1c;
    border-radius: 5px;
  }
`;

export default function Gnb() {
  return (
    <Nav>
      <Link to="/">
        <img src={logoPng} alt="logo" width={70} height={70} />
      </Link>
      <ul>
        <li>
          <NavLinks to="/">Home</NavLinks>
        </li>
        <li>
          <NavLinks to="/labeling">Labeling</NavLinks>
        </li>
      </ul>
    </Nav>
  );
}
