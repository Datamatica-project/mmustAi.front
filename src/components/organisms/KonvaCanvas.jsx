import React, { useEffect, useRef, useState } from "react";
import { Layer, Line, Rect, Stage, Text } from "react-konva";
import styled from "styled-components";
import LabelTooltip from "../molecules/LabelTooltip";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  canvas {
    cursor: pointer;
  }
`;

export default function KonvaCanvas({ selectButton, classes }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 790, height: 600 });
  const [mode, setMode] = useState("Bounding Box");
  const [rectangles, setRectangles] = useState([]); // 바운딩 박스 목록
  const [newRect, setNewRect] = useState(null); // 새로운 바운딩 박스
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태

  const [polygonPoints, setPolygonPoints] = useState([]); // 폴리곤 점 목록
  const [mousePosition, setMousePosition] = useState(null); // 폴리곤 마우스 위치
  const [completedPolygons, setCompletedPolygons] = useState([]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [labelData, setLabelData] = useState({
    className: "No Class",
    objectName: "",
    id: `obj_${Date.now()}`,
  });

  useEffect(() => {
    if (selectButton === "Bounding Box") {
      setMode("boundingBox");
    } else if (selectButton === "Polygon") {
      setMode("polygon");
    }
  }, [selectButton]);

  // 컨테이너 크기 업데이트
  useEffect(() => {
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

  // 도형 완성 시 툴팁 표시
  const handleShapeComplete = (shapeData) => {
    console.log(shapeData);
    let centerX, centerY;

    if (shapeData.type === "boundingBox") {
      centerX = shapeData.x + shapeData.width / 2;
      centerY = shapeData.y + shapeData.height / 2;
    } else if (shapeData.type === "polygon") {
      const points = shapeData.points;
      centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    }

    setShowTooltip(true);
    setTooltipPosition({ x: centerX, y: centerY });
    setCurrentShape(shapeData);
  };

  // 바운딩 박스 이벤트 핸들러
  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (mode === "boundingBox") {
      setNewRect({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        id: `rect-${rectangles.length + 1}`,
      });
      setIsDragging(true);
    } else if (mode === "polygon") {
      setPolygonPoints([...polygonPoints, { x: point.x, y: point.y }]);
    }
  };

  // 마우스 이동 시 바운딩 박스 크기 업데이트
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (mode === "boundingBox" && isDragging && newRect) {
      const width = point.x - newRect.x;
      const height = point.y - newRect.y;

      setNewRect({
        ...newRect,
        width,
        height,
      });
    } else if (mode === "polygon") {
      setMousePosition(point);
    }
  };

  // 마우스 업 시 바운딩 박스 완성
  const handleMouseUp = () => {
    if (newRect) {
      setRectangles([...rectangles, newRect]);
      handleShapeComplete({
        type: "boundingBox",
        x: newRect.x,
        y: newRect.y,
        width: newRect.width,
        height: newRect.height,
        id: `rect-${rectangles.length + 1}`,
      });
      setNewRect(null);
    }
    setIsDragging(false);
  };

  // 이중 클릭 시 폴리곤 완성
  const handleDoubleClick = (e) => {
    if (mode !== "polygon") return;

    if (polygonPoints.length >= 3) {
      const closedPoints = [...polygonPoints, polygonPoints[0]];
      setCompletedPolygons([...completedPolygons, closedPoints]);
      handleShapeComplete({
        type: "polygon",
        points: closedPoints,
        id: `polygon-${completedPolygons.length + 1}`,
      });
      setPolygonPoints([]);
      setMousePosition(null);
    }
  };

  // 라벨 저장
  const handleLabelSave = () => {
    if (labelData.className === "No Class" || labelData.objectName === "") {
      alert("Please select a class and enter an object name");
      return;
    }
    const labeledObject = {
      ...currentShape,
      className: labelData.className,
      objectName: labelData.objectName,
      id: labelData.id,
    };
    console.log(labeledObject);
    setShowTooltip(false);
  };

  const handleLabelClear = () => {
    setShowTooltip(false);
    setLabelData({
      className: "No Class",
      objectName: "",
      id: `obj_${Date.now()}`,
    });
  };

  return (
    <Container ref={containerRef}>
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
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
          {polygonPoints.length > 0 && (
            <Line
              points={[
                ...polygonPoints.flatMap((p) => [p.x, p.y]),
                ...(mousePosition ? [mousePosition.x, mousePosition.y] : []),
              ]} // 일차원 배열로 변환
              stroke="blue"
              strokeWidth={2}
              strokeDashArray={mousePosition ? [5, 5] : undefined}
              closed={false}
            />
          )}
          {completedPolygons.map((polygon, index) => (
            <Line
              key={index}
              points={polygon.flatMap((p) => [p.x, p.y])} // 일차원 배열로 변환
              stroke="green"
              strokeWidth={2}
              closed={true}
            />
          ))}
        </Layer>
      </Stage>
      {showTooltip && (
        <LabelTooltip
          x={tooltipPosition.x}
          y={tooltipPosition.y - 50}
          classes={classes}
          onConfirm={handleLabelSave}
          onCancle={handleLabelClear}
          labelData={labelData}
          setLabelData={setLabelData}
        />
      )}
    </Container>
  );
}
