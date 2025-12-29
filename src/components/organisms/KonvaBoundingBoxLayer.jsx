import React, { useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { segmentImage, segmentImageBbox } from "../../api/sam";

export default function KonvaBoundingBoxLayer({
  width,
  height,
  onSelect,
  convertCanvasToImageCoords,
  imageToBase64,
  setIsSegmenting, // 세그멘테이션 로딩 상태 설정 함수
}) {
  const [newRect, setNewRect] = useState(null); // 새로운 바운딩 박스
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태
  const [rectangles, setRectangles] = useState([]);
  const stageRef = useRef(null);

  function konvaToDomCoords(kx, ky) {
    const stageRect = stageRef.current.container().getBoundingClientRect();

    return {
      x: stageRect.left + kx,
      y: stageRect.top + ky,
    };
  }

  // 바운딩 박스 이벤트 핸들러
  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    setNewRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
    setIsDragging(true);
  };

  // 마우스 이동 시 바운딩 박스 크기 업데이트
  const handleMouseMove = (e) => {
    if (!isDragging || !newRect) return;
    const pos = e.target.getStage().getPointerPosition();

    setNewRect({
      ...newRect,
      width: pos.x - newRect.x,
      height: pos.y - newRect.y,
    });
  };

  // 마우스 업 시 바운딩 박스 완성
  const handleMouseUp = async () => {
    if (!newRect) return;
    const finalized = { ...newRect, id: Date.now() };
    setRectangles((prev) => [...prev, finalized]);

    const img = document.querySelector(".target-image");

    const containerRect = document
      .querySelector(".image-container")
      .getBoundingClientRect();

    const { x: domX1, y: domY1 } = konvaToDomCoords(finalized.x, finalized.y);
    const { x: domX2, y: domY2 } = konvaToDomCoords(
      finalized.x + finalized.width,
      finalized.y + finalized.height
    );

    const p1 = convertCanvasToImageCoords(domX1, domY1, img, containerRect);
    const p2 = convertCanvasToImageCoords(domX2, domY2, img, containerRect);

    let x1 = Math.min(p1.x, p2.x);
    let y1 = Math.min(p1.y, p2.y);
    let x2 = Math.max(p1.x, p2.x);
    let y2 = Math.max(p1.y, p2.y);

    const samBBox = [x1, y1, x2, y2];

    const base64 = imageToBase64(img);

    setRectangles([]);
    setNewRect(null);
    setIsDragging(false);

    // === 2) SAM API 요청 ===
    // 세그멘테이션 요청 시작 - 로딩 상태 활성화
    if (setIsSegmenting) setIsSegmenting(true);
    try {
      const response = await segmentImageBbox(base64, samBBox);
      const newMask = response.mask;

      // mask 상태 업데이트는 SyntheticData에서 받아 처리
      onSelect(newMask);
    } catch (err) {
      console.error(err);
    } finally {
      // 요청 완료 후 로딩 상태 비활성화 (성공/실패 모두)
      if (setIsSegmenting) setIsSegmenting(false);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "auto",
      }}
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
            fill="#f6257979"
          />
        ))}
        {newRect && (
          <Rect
            x={newRect.x}
            y={newRect.y}
            width={newRect.width}
            height={newRect.height}
            stroke="#f62579"
            strokeWidth={2}
            fill="#f6257979"
          />
        )}
      </Layer>
    </Stage>
  );
}
