import React, { useEffect, useRef, useState } from "react";
import { DotMenuIcon, EditIcon, DeleteIcon } from "../icons/Icons";
import styled from "styled-components";

const DotMenuButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: fit-content;
`;
const MenuButton = styled.button`
  position: relative;
  z-index: 1000;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;
const DropdownMenu = styled.ul`
  transition: all 100ms ease-in-out;
  overflow: hidden;
  box-sizing: border-box;
  position: absolute;
  top: 100%;
  right: 0%;
  background-color: #3b3c5d;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 10px;

  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  max-height: 0;

  padding: 0;
  &.open {
    max-height: 100px;
  }
  &.close {
    max-height: 0;
  }

  li button {
    background: none;
    border: none;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 10px;
    list-style: none;
    padding: 10px 20px;
    cursor: pointer;
    color: #fff;
    white-space: nowrap;
  }

  li button:hover {
    background-color: #f0f0f0;
    color: #000;
    > svg {
      color: #000;
    }
  }
  li button svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: #fff;
  }

  .open {
    max-height: 200px; /* 충분한 높이값 설정 */
    padding: 10px;
  }

  .close {
    max-height: 0;
    padding: 0;
  }

  @media (max-width: 600px) {
    li button {
      font-size: 12px;
    }
    li button svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export default function DotMenuButton({ handleEditClick, handleDeleteClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 열림 상태
  const menuRef = useRef(null); // 메뉴 참조

  // 메뉴 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 메뉴 클릭 시 메뉴 열림
  const onMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <DotMenuButtonContainer ref={menuRef}>
      <MenuButton aria-label="메뉴" onClick={(e) => onMenuClick(e)}>
        {DotMenuIcon}
      </MenuButton>
      {isMenuOpen && (
        <DropdownMenu className={`${isMenuOpen ? "open" : "close"}`}>
          <li>
            <button onClick={(e) => handleEditClick(e)}>
              {EditIcon}
              <span>수정</span>
            </button>
          </li>
          <li>
            <button onClick={(e) => handleDeleteClick(e)}>
              {DeleteIcon}
              <span>삭제</span>
            </button>
          </li>
        </DropdownMenu>
      )}
    </DotMenuButtonContainer>
  );
}
