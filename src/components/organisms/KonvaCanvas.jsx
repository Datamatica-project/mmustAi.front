import React, { useEffect, useRef, useState } from "react";
import { Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import styled from "styled-components";
import LabelTooltip from "../molecules/LabelTooltip";
import { useParams } from "react-router-dom";
import { postObjectLabel, updateObject } from "../../api/Job";
import { uselabelDataFlagStore, useObjectStore } from "../../store/bboxStore";
import { useToastStore } from "../../store/toastStore";

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
  highlightedObjectId,
  setHighlightedObjectId,
}) {
  const containerRef = useRef(null);
  const transformerRef = useRef(null); // objectsStore 박스용 Transformer ref
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
  const [selectedShapeId, setSelectedShapeId] = useState(null); // 선택된 도형 ID

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

  // jobId가 변경될 때 Transformer 해제
  useEffect(() => {
    if (setHighlightedObjectId) {
      setHighlightedObjectId(null);
    }
    setSelectedShapeId(null);
  }, [jobId, setHighlightedObjectId]);

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

  // YOLO 형식(좌상단 좌표 기준) 객체를 캔버스 좌표로 변환하는 함수
  // 입력: {x, y, w, h} 형식의 객체 (x, y는 좌상단 좌표, 0~1 정규화)
  const convertYOLOToCanvasCoordsFromObject = (yoloObj) => {
    const {
      x: normalizedX,
      y: normalizedY,
      w: normalizedWidth,
      h: normalizedHeight,
    } = yoloObj;

    // 이미지 원본 크기
    const imgWidth = imageSize.width || size.width;
    const imgHeight = imageSize.height || size.height;

    // 정규화된 좌상단 좌표를 이미지 원본 크기로 변환 (x, y는 이미 좌상단 좌표)
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

  // 툴팁 esc로 닫기
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        handleLabelClear();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // objectsStore 박스용 Transformer 연결 (highlightedObjectId가 변경될 때)
  useEffect(() => {
    if (!transformerRef.current || !highlightedObjectId) {
      return;
    }

    const stage = transformerRef.current.getStage();
    if (!stage) return;

    // highlightedObjectId에 해당하는 Rect 노드 찾기
    const node = stage.findOne(`#saved-obj-${highlightedObjectId}`);
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [highlightedObjectId]);

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

    // 현재 job의 오브젝트 개수를 기반으로 자동 ID 생성
    // objectsStore에 현재 job의 모든 오브젝트가 포함되어 있으므로 길이를 사용
    const currentObjectCount = objectsStore?.length || 0;
    const nextObjectId = currentObjectCount + 1;

    // labelData에 자동 생성된 ID를 objectName으로 설정
    setLabelData({
      className: "No Class",
      objectName: nextObjectId.toString(), // 자동 생성된 ID를 문자열로 저장
      id: 0,
    });

    // 툴팁 크기 추정 (대략적인 값, 실제 크기에 맞게 조정 필요)
    const TOOLTIP_WIDTH = 300; // 툴팁의 대략적인 너비
    const TOOLTIP_HEIGHT = 330; // 툴팁의 대략적인 높이
    const PADDING = 10; // 캔버스 경계로부터의 여백

    // 캔버스 경계를 벗어나지 않도록 위치 조정
    let adjustedX = centerX;
    let adjustedY = centerY;

    // 오른쪽 경계 체크
    if (centerX + TOOLTIP_WIDTH > size.width) {
      adjustedX = size.width - TOOLTIP_WIDTH - PADDING;
    }
    // 왼쪽 경계 체크
    if (centerX < 0) {
      adjustedX = PADDING;
    }
    // 아래쪽 경계 체크
    if (centerY + TOOLTIP_HEIGHT > size.height) {
      adjustedY = size.height - TOOLTIP_HEIGHT - PADDING;
    }
    // 위쪽 경계 체크
    if (centerY < 0) {
      adjustedY = PADDING;
    }

    setShowTooltip(true);
    setTooltipPosition({ x: adjustedX, y: adjustedY });
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

  // 바운딩 박스 이벤트 핸들러 (Stage 레벨)
  const handleMouseDown = (e) => {
    // 툴팁이 표시 중이면 새로운 박스를 그리지 못하도록 막음 (저장/취소 후에만 다음 박스 그리기 가능)
    if (showTooltip) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // 클릭한 위치에 Shape가 있는지 확인 (getIntersection 사용)
    const clickedShape = stage.getIntersection(point);
    if (clickedShape && clickedShape.getType() === "Shape") {
      return;
    }
    // 빈 공간 클릭 시 선택 해제 및 새 박스 그리기 시작
    setSelectedShapeId(null);
    // 저장된 객체의 강조 표시도 해제
    if (setHighlightedObjectId) {
      setHighlightedObjectId(null);
    }

    // 새 박스 그리기 시작
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
      // 클릭만 하고 드래그하지 않은 경우 (너무 작은 박스) 툴팁을 띄우지 않음
      const MIN_BOX_SIZE = 5; // 최소 박스 크기 (px)
      const boxWidth = Math.abs(newRect.width);
      const boxHeight = Math.abs(newRect.height);

      // 박스가 최소 크기 이상이면 생성, 그렇지 않으면 무시
      if (boxWidth >= MIN_BOX_SIZE && boxHeight >= MIN_BOX_SIZE) {
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
      }
      // 작은 박스이거나 클릭만 한 경우 newRect 초기화 (툴팁 띄우지 않음)
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

      // 폴리곤 ID 생성 (한 번만 생성하여 일관성 유지)
      const polygonId = `polygon-${Date.now()}-${Math.random()}`;

      const newShape = {
        type: "polygon",
        zIndex: maxZIndex + 1,
        points: closedPoints,
        id: polygonId,
      };
      setShapes([...shapes, newShape]);
      setMaxZIndex(maxZIndex + 1);

      // handleShapeComplete에 실제 생성된 폴리곤의 ID 전달
      handleShapeComplete({
        type: "polygon",
        points: closedPoints,
        id: polygonId, // 동일한 ID 사용
      });
      setPolygonPoints([]);
      setMousePosition(null);
    }
  };

  // 폴리곤 점들을 바운딩 박스로 변환하는 함수
  const polygonToBoundingBox = (points) => {
    if (!points || points.length === 0) return null;

    // 모든 점의 x, y 좌표에서 최소/최대값 찾기
    const xCoords = points.map((p) => p.x);
    const yCoords = points.map((p) => p.y);

    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    // 바운딩 박스 좌표 계산 (좌상단 좌표와 너비/높이)
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
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
    // 예외처리: 클래스만 선택되었는지 확인 (objectName은 자동 생성되므로 검증 불필요)
    if (labelData.className === "No Class") {
      useToastStore.getState().addToast("Please select a class", "error");
      return;
    }

    // 선택한 클래스의 색상 찾기
    const selectedClass = classes.find(
      (cls) => cls.name === labelData.className
    );

    const classColor = selectedClass?.hexColor || "#f62579";
    let yoloFormat;
    let bboxId = null; // 생성된 바운딩 박스 ID 추적

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

      bboxId = currentShape.id;

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
    // 폴리곤인 경우 - 바운딩 박스로 변환하여 시각화하고 폴리곤 제거
    else if (currentShape?.type === "polygon") {
      // 폴리곤 점들을 바운딩 박스로 변환
      const bbox = polygonToBoundingBox(currentShape.points);

      if (!bbox) {
        useToastStore.getState().addToast("Invalid polygon data", "error");
        return;
      }

      // YOLO 형식으로 변환
      yoloFormat = convertToYOLOFormat(bbox, labelData.className);

      // 바운딩 박스 ID 생성
      bboxId = `bbox-from-polygon-${Date.now()}-${Math.random()}`;

      // 폴리곤을 shapes에서 제거하고 바운딩 박스를 추가 (시각화)
      setShapes((prevShapes) => {
        // 폴리곤 제거 (Cancel 버튼처럼 마지막 shape 제거)
        const filteredShapes = prevShapes.filter(
          (shape) => shape.id !== currentShape.id
        );

        // 변환된 바운딩 박스 추가 (시각화)
        const newBoundingBox = {
          type: "boundingBox",
          zIndex: maxZIndex + 1,
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
          id: bboxId,
          color: classColor,
          className: labelData.className,
        };

        return [...filteredShapes, newBoundingBox];
      });
      setMaxZIndex(maxZIndex + 1);

      // 콜백 함수가 있으면 호출
      if (onBoundingBoxComplete) {
        onBoundingBoxComplete(
          yoloFormat,
          labelData.className,
          labelData.objectName,
          bboxId // 변환된 바운딩 박스 ID 전달
        );
      }
    } else {
      // 알 수 없는 타입인 경우 에러 처리
      useToastStore.getState().addToast("Unknown shape type", "error");
      return;
    }

    // yoloFormat이 설정되지 않은 경우 에러 처리
    if (!yoloFormat) {
      useToastStore
        .getState()
        .addToast("Failed to convert shape to YOLO format", "error");
      return;
    }

    try {
      const response = await postObjectLabel(
        jobId,
        labelData.id,
        yoloFormat,
        labelData
      );

      // 서버 저장 성공 시 shapes에서 해당 shape 제거 (중복 렌더링 방지)
      // 서버에서 다시 불러올 때 objectsStore에 포함되어 렌더링됨
      if (bboxId) {
        setShapes((prevShapes) =>
          prevShapes.filter((shape) => shape.id !== bboxId)
        );
      }

      setLabelData({
        className: "No Class",
        objectName: "", // 다음 오브젝트를 위해 초기화
        id: 0,
      });

      setShowTooltip(false);
      setLabelDataFlag(!labelDataFlag);

      useToastStore.getState().addToast("Label saved successfully", "success");
    } catch (error) {
      console.error("Error saving label:", error);
      useToastStore.getState().addToast("Failed to save label", "error");
    }
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
      objectName: "", // 다음 오브젝트를 위해 초기화
      id: 0,
    });
  };

  // objectsStore 박스용 YOLO 형식 변환 함수 (클래스 ID 직접 사용)
  const convertToYOLOFormatForObject = (bbox, classId) => {
    // 이미지 원본 크기
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
    const normalizedX = originalX / imgWidth;
    const normalizedY = originalY / imgHeight;
    const normalizedWidth = originalW / imgWidth;
    const normalizedHeight = originalH / imgHeight;

    return [
      classId,
      normalizedX,
      normalizedY,
      normalizedWidth,
      normalizedHeight,
    ];
  };

  // objectsStore 박스용 Transform 종료 핸들러 (크기 조절 후 API 호출)
  const handleSavedObjectTransformEnd = async (e) => {
    const node = e.target;
    // id 형식: "saved-obj-{obj.id}"에서 obj.id 추출
    const idStr = node.id().replace("saved-obj-", "");
    const objectId = parseInt(idStr);
    const obj = objectsStore?.find((o) => o.id === objectId);

    if (!obj) return;

    // Transformer가 적용된 Rect의 새로운 위치와 크기
    const newX = node.x();
    const newY = node.y();
    const newWidth = node.width() * node.scaleX();
    const newHeight = node.height() * node.scaleY();

    // scale 초기화 (Transformer 사용 후 scale을 1로 리셋)
    node.scaleX(1);
    node.scaleY(1);
    node.width(newWidth);
    node.height(newHeight);

    // 클래스 ID 찾기
    const classId = obj.annotation?.class_id || obj.labelData?.class_id || 0;

    // YOLO 형식으로 변환
    const yoloFormat = convertToYOLOFormatForObject(
      {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      },
      classId
    );

    // API 호출을 위한 데이터 준비
    const updateData = {
      name: obj.name || "",
      labelType: "BOUNDING_BOX",
      formatType: "YOLO",
      labelData: yoloFormat.join(" "), // 배열을 공백으로 연결된 문자열로 변환
    };

    try {
      await updateObject(objectId, updateData);
      // 성공 시 objectsStore 새로고침을 위해 labelDataFlag 변경
      setLabelDataFlag(!labelDataFlag);
      useToastStore
        .getState()
        .addToast("Object updated successfully", "success");
    } catch (error) {
      console.error("Error updating object:", error);
      useToastStore.getState().addToast("Failed to update object", "error");
    }
  };

  // objectsStore 박스용 Drag 종료 핸들러 (위치 이동 후 API 호출)
  const handleSavedObjectDragEnd = async (e) => {
    const node = e.target;
    // id 형식: "saved-obj-{obj.id}"에서 obj.id 추출
    const idStr = node.id().replace("saved-obj-", "");
    const objectId = parseInt(idStr);
    const obj = objectsStore?.find((o) => o.id === objectId);

    if (!obj) return;

    // 드래그된 Rect의 새로운 위치
    const newX = node.x();
    const newY = node.y();
    const newWidth = node.width();
    const newHeight = node.height();

    // 클래스 ID 찾기
    const classId = obj.annotation?.class_id || obj.labelData?.class_id || 0;

    // YOLO 형식으로 변환
    const yoloFormat = convertToYOLOFormatForObject(
      {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      },
      classId
    );

    // API 호출을 위한 데이터 준비
    const updateData = {
      name: obj.name || "",
      labelType: "BOUNDING_BOX",
      formatType: "YOLO",
      labelData: yoloFormat.join(" "), // 배열을 공백으로 연결된 문자열로 변환
    };

    try {
      await updateObject(objectId, updateData);
      // 성공 시 objectsStore 새로고침을 위해 labelDataFlag 변경
      setLabelDataFlag(!labelDataFlag);
      useToastStore
        .getState()
        .addToast("Object updated successfully", "success");
    } catch (error) {
      console.error("Error updating object:", error);
      useToastStore.getState().addToast("Failed to update object", "error");
    }
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
                const isSelected = selectedShapeId === shape.id;
                return (
                  <Rect
                    key={shape.id}
                    id={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={isSelected ? "#FFFF00" : shapeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    fill={colorToRgba(shapeColor, isSelected ? 0.3 : 0.5)}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedShapeId(shape.id);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedShapeId(shape.id);
                    }}
                    shadowBlur={isSelected ? 10 : 0}
                    shadowColor={isSelected ? "#FFFF00" : "transparent"}
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
            const isHighlighted = highlightedObjectId === obj.id;

            // 새로운 데이터 구조: obj.annotation.yolo 형식 확인
            // annotation.yolo는 {x, y, w, h} 형식 (중심 좌표 기준)
            let yoloData = null;

            if (obj.annotation?.yolo) {
              // 새로운 구조: annotation.yolo 객체 형식
              yoloData = obj.annotation.yolo;
            } else if (
              obj.labelData?.bbox &&
              Array.isArray(obj.labelData.bbox)
            ) {
              // 기존 구조: labelData.bbox 배열 형식 (하위 호환성)
              const bbox = obj.labelData.bbox;
              const coords = bbox.length === 5 ? bbox.slice(1) : bbox;
              const [x, y, w, h] = coords;
              yoloData = { x, y, w, h };
            }

            if (yoloData) {
              // YOLO 형식(중심 좌표)을 캔버스 좌표로 변환
              const canvasCoords =
                convertYOLOToCanvasCoordsFromObject(yoloData);

              // 클래스 색상 찾기
              // annotation.class_id 또는 labelData.class_id 또는 obj의 정보 사용
              const classId =
                obj.annotation?.class_id || obj.labelData?.class_id;
              const classInfo = classes.find((cls) => cls.id === classId);
              // 클래스에서 찾지 못하면 객체 자체의 hexColor 사용, 없으면 기본색
              const color = classInfo?.hexColor || obj.hexColor || "#f62579";

              return (
                <Rect
                  key={`saved-obj-${obj.id}-${index}`}
                  id={`saved-obj-${obj.id}`}
                  x={canvasCoords.x}
                  y={canvasCoords.y}
                  width={canvasCoords.width}
                  height={canvasCoords.height}
                  stroke={isHighlighted ? "#FFFF00" : color}
                  strokeWidth={isHighlighted ? 3 : 2}
                  fill={colorToRgba(color, isHighlighted ? 0.3 : 0.2)}
                  draggable={isHighlighted}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    if (setHighlightedObjectId) {
                      setHighlightedObjectId(obj.id);
                    }
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    if (setHighlightedObjectId) {
                      setHighlightedObjectId(obj.id);
                    }
                  }}
                  onTransformEnd={handleSavedObjectTransformEnd}
                  onDragEnd={handleSavedObjectDragEnd}
                  shadowBlur={isHighlighted ? 10 : 0}
                  shadowColor={isHighlighted ? "#FFFF00" : "transparent"}
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

          {/* objectsStore 박스용 Transformer */}
          {highlightedObjectId && (
            <Transformer
              ref={transformerRef}
              flipEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                // 최소 크기 제한 (5px)
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              anchorFill="#ffffff"
              anchorStroke="#f62579"
              borderStroke="#f62579"
              borderStrokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
      {showTooltip && (
        <LabelTooltip
          x={tooltipPosition.x}
          y={tooltipPosition.y}
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
