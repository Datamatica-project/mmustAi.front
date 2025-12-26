import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DotMenuIcon, EditIcon, DeleteIcon } from "../icons/Icons";
import styled from "styled-components";

const DotMenuButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: fit-content;
  z-index: 999;
`;
const MenuButton = styled.button`
  position: relative;
  z-index: 10;
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
  position: fixed; // ✅ 동적 위치 적용을 위해 fixed로 변경
  //top, right는 동적으로 인라인 변환
  background-color: #3b3c5d;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 10px;

  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
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

export default function DotMenuButton({
  handleEditClick,
  handleDeleteClick,
  setHighlightedObjectId,
  objId,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 열림 상태
  const menuRef = useRef(null); // 메뉴 참조 (Portal로 렌더링된 메뉴)
  const buttonRef = useRef(null); // ✅ 버튼 ref 추가
  const containerRef = useRef(null); // 버튼 컨테이너 ref
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 }); // ✅ 위치 상태 추가

  // 메뉴 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      // 버튼 컨테이너나 메뉴 내부를 클릭한 경우 제외
      const isClickInsideButton = containerRef.current?.contains(e.target);
      const isClickInsideMenu = menuRef.current?.contains(e.target);

      if (!isClickInsideButton && !isClickInsideMenu) {
        setIsMenuOpen(false);
        setHighlightedObjectId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, setHighlightedObjectId]);

  // ✅ 스크롤/리사이즈 이벤트 감지하여 메뉴 닫기 및 위치 업데이트
  useEffect(() => {
    if (!isMenuOpen) return;

    const updateMenuPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom,
          right: window.innerWidth - rect.right,
        });
      }
    };

    const handleScroll = () => {
      setIsMenuOpen(false);
      setHighlightedObjectId(null);
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    // 모든 스크롤 가능한 부모 요소에서 스크롤 감지
    const findScrollContainer = (element) => {
      let parent = element?.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          return parent;
        }
        parent = parent.parentElement;
      }
      return window;
    };

    const scrollContainer = buttonRef.current
      ? findScrollContainer(buttonRef.current)
      : window;

    scrollContainer.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen, setHighlightedObjectId]);

  // 메뉴 클릭 시 메뉴 열림
  const onMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // ✅ Portal 사용 시 getBoundingClientRect()로 화면 좌표 직접 계산
      setMenuPosition({
        top: rect.bottom, // 버튼 아래쪽 (스크롤 포함된 절대 좌표)
        right: window.innerWidth - rect.right, // 화면 오른쪽에서의 거리
      });
    }

    setIsMenuOpen(!isMenuOpen);
    setHighlightedObjectId(objId);
  };

  return (
    <>
      <DotMenuButtonContainer ref={containerRef}>
        <MenuButton
          ref={buttonRef}
          aria-label="메뉴"
          onClick={(e) => onMenuClick(e)}
        >
          {DotMenuIcon}
        </MenuButton>
      </DotMenuButtonContainer>
      {/* ✅ Portal을 사용하여 body에 직접 렌더링 - z-index 문제 해결 */}
      {isMenuOpen &&
        createPortal(
          <DropdownMenu
            ref={menuRef}
            className={`${isMenuOpen ? "open" : "close"}`}
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
          >
            {handleEditClick && (
              <li>
                <button onClick={(e) => handleEditClick(e)}>
                  {EditIcon}
                  <span>수정</span>
                </button>
              </li>
            )}
            <li>
              <button onClick={(e) => handleDeleteClick(e)}>
                {DeleteIcon}
                <span>삭제</span>
              </button>
            </li>
          </DropdownMenu>,
          document.body
        )}
    </>
  );
}
