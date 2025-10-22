import React, { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage, Text } from "react-konva";
import styled from "styled-components";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export default function KonvaCanvas() {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 790, height: 600 });
  const [rectangles, setRectangles] = useState([]);
  const [newRect, setNewRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // 컨테이너 크기 업데이트
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 바운딩 박스 이벤트 핸들러
  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setNewRect({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      id: `rect-${rectangles.length + 1}`,
    });
    setIsDragging(true);
  };
  const handleMouseMove = (e) => {
    if (!isDragging || !newRect) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const width = point.x - newRect.x;
    const height = point.y - newRect.y;

    setNewRect({
      ...newRect,
      width,
      height,
    });
  };
  const handleMouseUp = () => {
    if (newRect) {
      setRectangles([...rectangles, newRect]);
      setNewRect(null);
    }
    setIsDragging(false);
  };

  return (
    <Container ref={containerRef}>
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {rectangles.map((rect) => (
            <Rect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke="#f62579"
              strokeWidth={2}
            />
          ))}

          {newRect && (
            <Rect
              x={newRect.x}
              y={newRect.y}
              width={newRect.width}
              height={newRect.height}
              stroke="yellow"
              dash={[4, 4]}
            />
          )}
        </Layer>
      </Stage>
    </Container>
  );
}
