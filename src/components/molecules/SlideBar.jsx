import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import CountButtonBox from "./CountButtonBox";

const Container = styled.div`
  max-width: 270px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  h3 {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: #5e5f7d;

    span {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
    }
  }
  .slide-bar__container {
  }
  .slide-bar__background {
    width: 100%;
    height: 5px;
    background-color: #ffffff;
    border-radius: 5px;
  }

  .slide-bar__colorOptions {
    display: flex;
    gap: 12px;
  }
`;

const Slider = styled.div`
  width: ${({ $percentage }) => `${$percentage}%`};
  height: 100%;
  background-color: #f92d80;
  border-radius: 5px;
  position: relative;

  div {
    position: absolute;
    z-index: 10; // 추가 - 다른 요소 위에 표시
    top: 50%;
    right: 0%;
    transform: translate(+50%, -50%);

    width: 20px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  }
`;

const ColorListItem = styled.li`
  cursor: pointer;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 1px solid #ffffff36;
  box-sizing: border-box;
  box-shadow: ${({ $color }) => `0 0 5.2px 3px ${$color}40`};
`;

export default function SlideBar() {
  const colorOptions = ["#C41E21", "#A1B62C", "#24B44A", "#213DBC", "#682FAA"];
  const [percentage, setPercentage] = useState(0);
  const isDraggingRef = useRef(false);
  const slideBarRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (slideBarRef.current) {
        // 슬라이더 영역 좌표 계산
        const rect = slideBarRef.current.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;

        // 슬라이더 영역 내에 클릭 이벤트가 발생했는지 확인
        const padding = 15; // 핸들 크기 고려한 여유 공간
        const isInsideSlider =
          clickX >= rect.left - padding &&
          clickX <= rect.right + padding &&
          clickY >= rect.top - padding &&
          clickY <= rect.bottom + padding;
        // 슬라이더 영역 내에 클릭 이벤트가 발생했으면 드래그 시작
        if (isInsideSlider) {
          isDraggingRef.current = true;
          document.body.style.cursor = "grabbing"; // 드래그 시작 시
          document.body.style.userSelect = "none"; // 텍스트 선택 방지

          const newPercentage = ((clickX - rect.left) / rect.width) * 100;
          setPercentage(Math.min(Math.max(newPercentage, 1), 100));
        }
      }
    };
    const handleMouseMove = (e) => {
      if (isDraggingRef.current && slideBarRef.current) {
        const rect = slideBarRef.current.getBoundingClientRect();
        const newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
        setPercentage(Math.min(Math.max(newPercentage, 0), 100));
      }
    };

    const handleMouseUp = (e) => {
      isDraggingRef.current = false;
      document.body.style.cursor = ""; // 원래대로 복원
      document.body.style.userSelect = ""; // 원래대로 복원
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  return (
    <Container>
      <h3>
        Mask Opacity: <span>{percentage.toFixed(0)}%</span>
      </h3>
      <div className="slide-bar__container">
        <div className="slide-bar__background" ref={slideBarRef}>
          <Slider $percentage={percentage}>
            <div className="slide-bar__slider__handle" />
          </Slider>
        </div>
      </div>
      <ul className="slide-bar__colorOptions">
        {colorOptions.map((color) => (
          <ColorListItem key={color} $color={color} />
        ))}
      </ul>
    </Container>
  );
}
