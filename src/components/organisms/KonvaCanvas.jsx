import React, { useEffect, useRef, useState } from "react";
import { Layer, Line, Rect, Stage, Text } from "react-konva";
import styled from "styled-components";
import LabelTooltip from "../molecules/LabelTooltip";
import { useParams } from "react-router-dom";
import { postObjectLabel } from "../../api/Job";
import { uselabelDataFlagStore, useObjectStore } from "../../store/bboxStore";

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

export default function KonvaCanvas({
  selectButton,
  classes,
  onBoundingBoxComplete,
  imageRef,
  deletedShapeIds = [],
  jobData,
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 790, height: 600 });
  const [mode, setMode] = useState("Bounding Box");
  const [imageSize, setImageSize] = useState({ width: 790, height: 600 });

  // 이미지 원본 크기 업데이트
  useEffect(() => {
    if (imageRef) {
      const updateImageSize = () => {
        if (imageRef.naturalWidth && imageRef.naturalHeight) {
          setImageSize({
            width: imageRef.naturalWidth,
            height: imageRef.naturalHeight,
          });
        } else {
          // naturalWidth/Height가 없으면 표시 크기 사용
          setImageSize({
            width: imageRef.offsetWidth || size.width,
            height: imageRef.offsetHeight || size.height,
          });
        }
      };

      // 이미지가 이미 로드되어 있으면 즉시 업데이트
      if (imageRef.complete) {
        updateImageSize();
      } else {
        imageRef.addEventListener("load", updateImageSize);
      }

      return () => {
        if (imageRef) {
          imageRef.removeEventListener("load", updateImageSize);
        }
      };
    }
  }, [imageRef, size]);

  const [shapes, setShapes] = useState([]); // 모든 도형 목록
  const [maxZIndex, setMaxZIndex] = useState(0); // 최대 Z 인덱스

  const [newRect, setNewRect] = useState(null); // 새로운 바운딩 박스
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태

  const [polygonPoints, setPolygonPoints] = useState([]); // 폴리곤 점 목록
  const [mousePosition, setMousePosition] = useState(null); // 폴리곤 마우스 위치

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [labelData, setLabelData] = useState({
    className: "No Class",
    objectName: "",
    id: 0,
  });
  const { labelDataFlag, setLabelDataFlag } = uselabelDataFlagStore();

  const { jobId } = useParams();

  const { objectsStore } = useObjectStore();

  // YOLO 형식(좌상단 좌표 기준)을 캔버스 좌표로 변환하는 함수
  // 입력: [classId, normalizedX, normalizedY, normalizedWidth, normalizedHeight] 또는 [normalizedX, normalizedY, normalizedWidth, normalizedHeight]
  // normalizedX, normalizedY는 좌상단 좌표 (0~1 정규화)
  const convertYOLOToCanvasCoords = (yoloBbox) => {
    // classId가 포함되어 있는지 확인 (5개 요소면 classId 포함, 4개면 좌표만)
    const coords = yoloBbox.length === 5 ? yoloBbox.slice(1) : yoloBbox;
    const [normalizedX, normalizedY, normalizedWidth, normalizedHeight] =
      coords;

    // 이미지 원본 크기
    const imgWidth = imageSize.width || size.width;
    const imgHeight = imageSize.height || size.height;

    // 정규화된 좌상단 좌표를 이미지 원본 크기로 변환
    const xPixels = normalizedX * imgWidth;
    const yPixels = normalizedY * imgHeight;
    const widthPixels = normalizedWidth * imgWidth;
    const heightPixels = normalizedHeight * imgHeight;

    // 캔버스 크기로 스케일링 (이미지가 캔버스에 맞춰 표시되는 비율)
    const scaleX = size.width / imgWidth;
    const scaleY = size.height / imgHeight;

    // 캔버스 좌표로 변환
    return {
      x: xPixels * scaleX,
      y: yPixels * scaleY,
      // x: x * scaleX + (boxW * scaleX) / 2,
      // y: y * scaleY + (boxH * scaleY) / 2,
      width: widthPixels * scaleX,
      height: heightPixels * scaleY,
    };
  };

  // YOLO 형식으로 변환 (0~1 사이의 비율)
  const convertToYOLOFormat = (bbox, className) => {
    // 이미지 원본 크기 (naturalWidth/Height 사용)
    const imgWidth = imageSize.width || size.width;
    const imgHeight = imageSize.height || size.height;

    // 바운딩 박스 좌표 정규화 (음수 width/height 처리)
    const x = Math.min(bbox.x, bbox.x + bbox.width);
    const y = Math.min(bbox.y, bbox.y + bbox.height);
    const w = Math.abs(bbox.width);
    const h = Math.abs(bbox.height);

    // 캔버스 크기와 이미지 원본 크기의 비율 계산
    const scaleX = imgWidth / size.width;
    const scaleY = imgHeight / size.height;

    // 캔버스 좌표를 이미지 원본 크기로 변환
    const originalX = x * scaleX;
    const originalY = y * scaleY;
    const originalW = w * scaleX;
    const originalH = h * scaleY;

    // 좌상단 좌표 기준 형식: [클래스, x, y, width, height] (모두 0~1 사이 정규화)
    // x, y는 바운딩 박스 좌상단 모서리의 정규화된 좌표
    const normalizedX = originalX / imgWidth;
    const normalizedY = originalY / imgHeight;

    const normalizedWidth = originalW / imgWidth;
    const normalizedHeight = originalH / imgHeight;

    // 클래스 ID 찾기 (classes 배열에서)
    const classIndex = classes.findIndex((cls) => cls.name === className);
    const classId = classIndex !== -1 ? classIndex : 0;

    return [
      classId,
      normalizedX,
      normalizedY,
      normalizedWidth,
      normalizedHeight,
    ];
  };

  // 외부에서 전달된 삭제 대상 shape id 목록을 기준으로 도형 제거
  useEffect(() => {
    if (!deletedShapeIds || deletedShapeIds.length === 0) return;

    setShapes((prevShapes) =>
      prevShapes.filter((shape) => !deletedShapeIds.includes(shape.id))
    );
  }, [deletedShapeIds]);

  // 선택 모드 업데이트
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

  // 폴리곤 키보드 이벤트
  useEffect(() => {
    const onKeyDown = (e) => {
      if (mode !== "polygon" || showTooltip) return;

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setPolygonPoints((prev) => {
          if (prev.length === 0) return prev;
          const next = prev.slice(0, -1);
          if (next.length === 0) setMousePosition(null);
          return next;
        });
      }

      if (e.key === "Escape" || e.key === "Backspace") {
        setPolygonPoints([]);
        setMousePosition(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, showTooltip]);

  // 도형 완성 시 툴팁 표시
  const handleShapeComplete = (shapeData) => {
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

  // 클릭 시 폴리곤 점 추가
  const handleOnClick = (e) => {
    if (e.evt.button !== 0) return;
    e.evt.stopPropagation();
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (mode !== "polygon") return;
    setPolygonPoints([...polygonPoints, { x: point.x, y: point.y }]);
  };

  // 바운딩 박스 이벤트 핸들러
  const handleMouseDown = (e) => {
    // 툴팁이 표시 중이면 새로운 박스를 그리지 못하도록 막음 (저장/취소 후에만 다음 박스 그리기 가능)
    if (showTooltip) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (mode === "boundingBox") {
      setNewRect({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        id: `bbox-${Date.now()}-${Math.random()}`,
      });
      setIsDragging(true);
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
    if (mode !== "boundingBox") return;
    if (newRect) {
      const newShape = {
        type: "boundingBox",
        zIndex: maxZIndex + 1,
        ...newRect,
      };
      setShapes([...shapes, newShape]);
      setMaxZIndex(maxZIndex + 1);

      handleShapeComplete({
        type: "boundingBox",
        x: newRect.x,
        y: newRect.y,
        width: newRect.width,
        height: newRect.height,
        id: newRect.id,
      });
      setNewRect(null);
    }
    setIsDragging(false);
  };

  // 폴리곤 완성
  const handlePolygonComplete = (e) => {
    if (mode !== "polygon") return;
    e.evt.preventDefault();

    if (polygonPoints.length >= 3) {
      const closedPoints = [...polygonPoints, polygonPoints[0]];

      const newShape = {
        type: "polygon",
        zIndex: maxZIndex + 1,
        points: closedPoints,
        id: `polygon-${Date.now()}-${Math.random()}`,
      };
      setShapes([...shapes, newShape]);
      setMaxZIndex(maxZIndex + 1);

      handleShapeComplete({
        type: "polygon",
        points: closedPoints,
        id: `polygon-${Date.now()}-${Math.random()}`,
      });
      setPolygonPoints([]);
      setMousePosition(null);
    }
  };

  // 색상을 CSS 색상 이름 또는 hex에서 rgba로 변환 (투명도 포함)
  const colorToRgba = (color, alpha = 0.5) => {
    // CSS 색상 이름인 경우 (hex 코드가 아닌 경우)
    if (!color.startsWith("#")) {
      // 임시 canvas를 사용하여 CSS 색상 이름을 RGB로 변환
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const imageData = ctx.getImageData(0, 0, 1, 1);
      const [r, g, b] = imageData.data;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // hex 코드인 경우
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 라벨 저장
  const handleLabelSave = async () => {
    // 예외처리
    if (labelData.className === "No Class" || labelData.objectName === "") {
      alert("Please select a class and enter an object name");
      return;
    }

    // 선택한 클래스의 색상 찾기
    const selectedClass = classes.find(
      (cls) => cls.name === labelData.className
    );

    const classColor = selectedClass?.hexColor || "#f62579";
    let yoloFormat;
    // 바운딩 박스인 경우 색상 업데이트
    if (currentShape?.type === "boundingBox") {
      // shapes 배열에서 해당 바운딩 박스 찾아서 색상 업데이트
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === currentShape.id
            ? { ...shape, color: classColor, className: labelData.className }
            : shape
        )
      );

      // YOLO 형식으로 변환
      yoloFormat = convertToYOLOFormat(
        {
          x: currentShape.x,
          y: currentShape.y,
          width: currentShape.width,
          height: currentShape.height,
        },
        labelData.className
      );

      // 콜백 함수가 있으면 호출
      if (onBoundingBoxComplete) {
        onBoundingBoxComplete(
          yoloFormat,
          labelData.className,
          labelData.objectName,
          currentShape.id // Konva shape id 전달
        );
      }
    }

    const response = await postObjectLabel(
      jobId,
      labelData.id,
      yoloFormat,
      labelData
    );

    // 서버 저장 성공 시 shapes에서 해당 shape 제거 (중복 렌더링 방지)
    // 서버에서 다시 불러올 때 objectsStore에 포함되어 렌더링됨
    if (currentShape?.id) {
      setShapes((prevShapes) =>
        prevShapes.filter((shape) => shape.id !== currentShape.id)
      );
    }

    setLabelData({
      className: "No Class",
      objectName: "",
      id: 0,
    });

    setShowTooltip(false);
    setLabelDataFlag(!labelDataFlag);
  };

  // 라벨 취소
  const handleLabelClear = () => {
    // 취소 시 생성된 도형 제거
    if (mode === "polygon") {
      setPolygonPoints([]);
      setMousePosition(null);
    }

    setShapes((prev) => prev.slice(0, -1));

    setShowTooltip(false);
    setLabelData({
      className: "No Class",
      objectName: "",
      id: 0,
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
        onContextMenu={handlePolygonComplete}
        onClick={handleOnClick}
      >
        <Layer>
          {shapes
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((shape) => {
              if (shape.type === "boundingBox") {
                // 저장된 색상이 있으면 사용, 없으면 기본 핑크색
                const shapeColor = shape.color || "#f62579";
                return (
                  <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shapeColor}
                    strokeWidth={2}
                    fill={colorToRgba(shapeColor, 0.5)}
                  />
                );
              } else if (shape.type === "polygon") {
                return (
                  <Line
                    key={shape.id}
                    points={shape.points.flatMap((p) => [p.x, p.y])}
                    stroke="#33D3ED"
                    strokeWidth={2}
                    closed={true}
                    fill="#33d4ed7c"
                  />
                );
              }
            })}

          {/* 저장된 객체들 렌더링 (서버에서 불러온 라벨링 데이터) */}
          {objectsStore?.map((obj, index) => {
            // labelData.bbox가 있는지 확인
            if (obj.labelData?.bbox && Array.isArray(obj.labelData.bbox)) {
              const bbox = obj.labelData.bbox;

              // YOLO 형식으로 변환된 좌표를 캔버스 좌표로 변환
              const canvasCoords = convertYOLOToCanvasCoords(bbox);

              // 클래스 색상 찾기 (labelData.class_id 또는 obj에 있는 정보 사용)
              const classId = obj.labelData?.class_id;
              const classInfo = classes.find((cls) => cls.id === classId);
              // 클래스에서 찾지 못하면 객체 자체의 hexColor 사용, 없으면 기본색
              const color = classInfo?.hexColor || obj.hexColor || "#f62579";

              return (
                <Rect
                  key={`saved-obj-${obj.id}-${index}`}
                  x={canvasCoords.x}
                  y={canvasCoords.y}
                  width={canvasCoords.width}
                  height={canvasCoords.height}
                  stroke={color}
                  strokeWidth={2}
                  fill={colorToRgba(color, 0.3)} // 저장된 객체는 약간 투명하게 표시
                  listening={false} // 클릭 이벤트 비활성화 (저장된 객체는 편집 불가)
                />
              );
            }
            return null;
          })}

          {newRect && (
            <Rect
              x={newRect.x}
              y={newRect.y}
              width={newRect.width}
              height={newRect.height}
              stroke="#f62579"
              dash={[4, 4]}
            />
          )}
          {polygonPoints.length > 0 && (
            <Line
              points={[
                ...polygonPoints.flatMap((p) => [p.x, p.y]),
                ...(mousePosition ? [mousePosition.x, mousePosition.y] : []),
              ]} // 일차원 배열로 변환
              stroke="#33D3ED"
              strokeWidth={2}
              strokeDashArray={mousePosition ? [5, 5] : undefined}
              closed={false}
            />
          )}
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
