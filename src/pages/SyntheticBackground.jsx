import React, { useEffect } from "react";
import { useRef, useState } from "react";
import PageHeader from "../components/organisms/PageHeader";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { LeftArrowIcon, RightArrowIcon } from "../components/icons/Icons";
import {
  PlusIcon,
  RemoveIcon,
  ScissorsIcon,
} from "../components/icons/Project";
import { cutoutDB } from "../utils/indexDB";
import {
  drawCutoutThumbnail,
  drawCutoutOnBackground,
  prepareCutout,
  exportComposite,
  calculateBBox,
} from "../utils/drawImg";
import { computeCompositeBBoxes } from "../utils/labelUtils";
import { ScaleMouseMove, TransformScale } from "../utils/scale";
import { RotateMouseMove, TransformRotate } from "../utils/rotate";
import { getCanvasPos } from "../utils/coordinate";
import { isOnRotateHandle } from "../utils/rotate";
import { isOnScaleHandle } from "../utils/scale";
import {
  isInsideObject,
  updateCanvasCursor,
  updateHoverCursor,
} from "../utils/mousecursorUtil";
import { useToastStore } from "../store/toastStore";
import { createSyntheticData } from "../api/syntheticApi";
import { generateUUID } from "../utils/generateUUID";
import { usePlacedObjectsStore } from "../store/projectStore";

const Container = styled.div`
  .description {
    margin-top: 10px;
    font-size: 20px;
    color: #b6b5c5;
    font-weight: 400;
  }
`;

const Main = styled.main`
  margin-top: 60px;

  aside {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .ButtonStyle {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #ffffff;
  }
  .ToolSection {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }
  display: flex;
  flex-direction: row;
  gap: 50px;

  .ToolButtons {
    display: flex;
    justify-content: center;
    border-bottom: 2px solid #3a3c55;
    button {
      padding: 10px 12px;
      font-size: 16px;
      font-weight: 700;
      color: #4f5973;
      svg {
        width: 20px;
        height: 20px;
        margin-right: 5px;
      }
      &.active {
        color: #ffffff;
      }
    }
  }

  .cutOutObjectButton {
    width: 90%;
    background-color: #3b3c5d;
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border-radius: 5px;
    margin-top: 20px;

    transition: all 0.2s ease;
    svg {
      width: 30px;
      height: 30px;
      color: #2abcf5;
    }
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    font-size: 24px;
    font-weight: 700;
  }
  button {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    border-radius: 10px;
    background-color: #f62579;
    color: #ffffff;
    font-size: 20px;
    font-weight: 700;
    padding: 5px 12px;
    border: none;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  button {
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    padding: 5px 12px;
    gap: 11px;
    border: 1px solid #5b5d75;
    color: #fff;
    background-color: transparent;
    cursor: pointer;
    transition-duration: 150ms;

    &:disabled {
      color: #5b5d75;
      cursor: default;
    }
  }

  span {
    font-size: 17px;
    font-weight: 700;
    font-family: inherit;
  }
`;

const ImageContainer = styled.div`
  overflow: hidden;
  width: 790px;
  height: 600px;
  position: relative;
  margin-bottom: 20px;
  /* display: inline-block; */
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    /* width: 100%; */
    height: 100%;
    /* object-fit: contain; */
  }
  .mask-canvas {
    position: absolute;
    /* top: 0;
    left: 0; */
    /* width: 100%; */
    height: 100%;
  }
`;

// 삭제 버튼 스타일 (Header 영역 근처 고정 위치)
const DeleteButton = styled.button`
  background-color: #f62579;
  color: #ffffff;
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;

  &:hover {
    background-color: #d41e66;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Sidebar = styled.aside`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;

  h3 {
    padding: 12px 12px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 2px solid #3a3c55;
  }
  svg {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }

  .image-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    height: 620px;
    align-content: start;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #5b5d75 #3a3c554e;
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background: #3a3c55;
    }
    &::-webkit-scrollbar-thumb {
      background: #5b5d75;
    }
    li {
      cursor: pointer;
      width: 160px;
      height: 160px;
      background-color: transparent;
      border: 2px solid #5b5d75;
      border-radius: 5px;
    }
    .selected {
      cursor: grab;
      border: 2px solid #f62579;
    }
  }
  .remove-button {
    background-color: transparent;
    border: 1px solid #3b3c5d;
    color: #ffffff;
    font-size: 17px;
    font-weight: 500;
    padding: 10px 20px;
    display: flex;
    gap: 5px;
    margin-left: auto;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    cursor: pointer;
    font-family: inherit;

    &:hover {
      background-color: #3b3c5d;
      color: #ffffff;
    }
  }
`;

export default function SyntheticBackground() {
  const ProjectName = "Project_1";
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bgCanvasRef = useRef(null); // 배경 캔버스 참조
  const [bgImage, setBgImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cutouts, setCutouts] = useState([]); // 원본 컷아웃 메타데이터
  const { placedObjects, setPlacedObjects } = usePlacedObjectsStore();
  const [activePlacedId, setActivePlacedId] = useState(null); // 현재 선택된 배치 객체
  const cutoutCacheRef = useRef(new Map());
  const [, forceRender] = useState(0);
  // 사이드바에서 선택된 컷아웃 (아직 배치 안 됨)
  const [activeCutout, setActiveCutout] = useState(null);
  const isDraggingRef = useRef(false); // 드래그 중인지 여부
  const dragOffsetRef = useRef({ x: 0, y: 0 }); // 드래그 중 오프셋

  // 스케일 조절 관련 상태
  const isScalingRef = useRef(false);
  const startScaleRef = useRef(1);
  const startDistanceRef = useRef(0);
  const scaleCenterRef = useRef(null);

  // 회전 조절 관련 상태
  const isRotatingRef = useRef(false);
  const startAngleRef = useRef(0);
  const startRotateRef = useRef(0);
  const { projectId, taskId } = useParams();
  const [imageStyle, setImageStyle] = useState({});

  // 이미지 로드 시 크기에 따라 스타일 설정
  useEffect(() => {
    if (!bgImage) {
      setImageStyle({});
      return;
    }

    const img = document.querySelector(".target-image");
    if (!img) return;

    const handleImageLoad = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // 가로가 더 길면 가로 100%, 세로가 더 길면 세로 100%
      if (naturalWidth > naturalHeight) {
        // 가로가 더 긴 경우
        setImageStyle({
          width: "100%",
          height: "auto",
        });
      } else {
        // 세로가 더 긴 경우
        setImageStyle({
          width: "auto",
          height: "100%",
        });
      }
    };

    // 이미지가 이미 로드되어 있으면 즉시 실행
    if (img.complete && img.naturalWidth > 0) {
      handleImageLoad();
    } else {
      img.addEventListener("load", handleImageLoad);
    }

    return () => {
      img.removeEventListener("load", handleImageLoad);
    };
  }, [bgImage]);

  useEffect(() => {
    // 캔버스 크기를 배경 이미지의 실제 표시 영역에 맞추기
    const canvas = bgCanvasRef.current;
    const img = document.querySelector(".target-image");
    if (!canvas || !img) return;

    // 배경 이미지의 실제 표시 영역 크기 (padding 제외)
    const imgRect = img.getBoundingClientRect();
    const actualImageWidth = imgRect.width;
    const actualImageHeight = imgRect.height;

    // 캔버스 크기를 배경 이미지의 실제 표시 영역에 맞춤
    canvas.width = actualImageWidth;
    canvas.height = actualImageHeight;
  }, [bgImage, imageStyle]);

  // 저장된 세션스토리지 클립아웃 소스 불러오기
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
    setCutouts(saved);
  }, [selectedImage]);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const safePlacedObjects = Array.isArray(placedObjects) ? placedObjects : [];
    // 배경 캔버스에 컷아웃 그리기
    placedObjects.forEach((obj) => {
      drawCutoutOnBackground({
        canvas,
        cutout: obj,
        transform: obj,
        activePlacedId,
        cutoutCacheRef,
      });
    });
  }, [placedObjects, bgImage, activePlacedId]);

  useEffect(() => {
    // cutouts 배열의 각 항목에 대해 prepareCutout을 비동기로 실행
    // 에러가 발생해도 다른 cutout 처리에 영향을 주지 않도록 Promise.allSettled 사용
    const processCutouts = async () => {
      try {
        await Promise.allSettled(
          cutouts.map((cutout) =>
            prepareCutout(cutout.id, cutout.bbox, cutoutCacheRef, forceRender)
          )
        );
      } catch (error) {
        // prepareCutout 내부에서 이미 에러 처리를 하므로 여기서는 로그만 남김
        console.error("Error processing cutouts:", error);
      }
    };
    processCutouts();
  }, [cutouts]);

  // 썸네일 이미지 클릭
  const handleSelectCoutout = (cutout) => {
    setSelectedImage(cutout.id);

    setActiveCutout(cutout);
  };

  // 컷아웃 삭제
  const handleDeleteCutout = async () => {
    if (!activeCutout) return;

    const id = activeCutout.id;

    //  sessionStorage 삭제
    const prev = JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
    const next = prev.filter((c) => c.id !== id);
    sessionStorage.setItem("cutoutSources", JSON.stringify(next));
    setCutouts(next);

    //  IndexedDB 삭제
    await cutoutDB.delete("images", id);
    await cutoutDB.delete("masks", id);

    //  배경에 배치된 객체도 제거
    setPlacedObjects((prev) => prev.filter((obj) => obj.sourceId !== id));

    useToastStore
      .getState()
      .addToast("Cutout deleted successfully.", "success");

    //  선택 해제
    setActiveCutout(null);
    setSelectedImage(null);
  };

  // 썸네일 이미지 드래그 시작
  const handleDragStart = (e, cutout) => {
    e.dataTransfer.setData("application/cutout", JSON.stringify(cutout));

    // 드래그 중 마우스 포인터 표시 개선 (선택)
    e.dataTransfer.effectAllowed = "copy";

    e.dataTransfer.setData("text/plain", cutout.id);
  };

  // 배경 캔버스에 컷아웃 드래그 시작
  const handleCanvasDrop = async (e) => {
    if (!bgImage) {
      useToastStore
        .getState()
        .addToast("Please select a background image first.", "error");
      return;
    }
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setBgImage(url);
        return; // 배경 이미지 설정 후 종료
      }
    }

    const data = e.dataTransfer.getData("application/cutout");
    if (!data) return;

    const cutout = JSON.parse(data);

    // 🔹 classId 가져오기: cutout에 없으면 세션 스토리지에서 찾기
    let classId = cutout.classId;
    if (!classId) {
      const cutoutSources =
        JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
      const sourceCutout = cutoutSources.find((c) => c.id === cutout.id);
      classId = sourceCutout?.classId;
    }

    // classId가 여전히 없으면 기본값 설정 또는 에러 처리
    if (!classId) {
      console.warn(`classId not found for cutout ${cutout.id}`);
      classId = "0"; // 기본값 또는 에러 처리
    }

    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    // 배경 이미지의 실제 표시 영역 기준으로 좌표 변환
    const { x: mouseX, y: mouseY } = getCanvasPos(e, canvas);

    const scale = 0.3;
    const { bbox } = cutout;

    const width = bbox.width * scale;
    const height = bbox.height * scale;

    const x = mouseX - width / 2;
    const y = mouseY - height / 2;

    // prepareCutout 실행 (에러가 발생해도 객체는 배치되도록 처리)
    try {
    await prepareCutout(cutout.id, cutout.bbox, cutoutCacheRef);
    } catch (error) {
      // prepareCutout 내부에서 이미 에러 처리를 하므로 여기서는 로그만 남김
      // 에러가 발생해도 객체는 배치되도록 계속 진행
      console.error(`Failed to prepare cutout for drop: ${cutout.id}`, error);
    }

    // 객체 배치 (prepareCutout 실패 여부와 관계없이 진행)
    setPlacedObjects((prev) => [
      ...prev,
      {
        id: generateUUID(),
        // sourceId: cutout.id,
        cutoutId: cutout.id, // 컷아웃 UUID (캐시 키용)
        sourceId: cutout.sourceId,
        classId: classId, // 확실히 설정된 classId 사용
        bbox,
        x,
        y,
        scale,
        rotate: 0,
      },
    ]);
  };

  const handleCanvasMouseDown = (e) => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPos(e, canvas);
    const objects = [...placedObjects].reverse();

    // 1️⃣ 회전 핸들
    const rotateTarget = objects.find((obj) =>
      isOnRotateHandle(obj, x, y, cutoutCacheRef)
    );
    if (rotateTarget) {
      TransformRotate(
        rotateTarget,
        x,
        y,
        canvas,
        setActivePlacedId,
        isRotatingRef,
        startAngleRef,
        startRotateRef
      );
      return;
    }

    // 2️⃣ 스케일 핸들
    const scaleTarget = objects.find((obj) =>
      isOnScaleHandle(obj, x, y, cutoutCacheRef)
    );
    if (scaleTarget) {
      TransformScale(
        scaleTarget,
        x,
        y,
        canvas,
        setActivePlacedId,
        updateCanvasCursor,
        scaleCenterRef,
        isScalingRef,
        startDistanceRef,
        startScaleRef
      );
      return;
    }

    // 3️⃣ 바디 (이동) - 마스크 기준 tight bbox로 판단
    const bodyTarget = objects.find((obj) =>
      isInsideObject(obj, x, y, cutoutCacheRef)
    );
    if (!bodyTarget) {
      setActivePlacedId(null);
      updateCanvasCursor(canvas, "default");
      return;
    }

    // 바운딩 박스 시각화를 위해 선택 상태로 설정
    setActivePlacedId(bodyTarget.id);
    isDraggingRef.current = true;

    dragOffsetRef.current = {
      x: x - bodyTarget.x,
      y: y - bodyTarget.y,
    };
  };

  const handleCanvasMouseMove = (e) => {
    if (!activePlacedId) return;

    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPos(e, canvas);

    // 🔹 스케일 조절 중
    if (isScalingRef.current) {
      ScaleMouseMove(
        canvas,
        x,
        y,
        setPlacedObjects,
        activePlacedId,
        startDistanceRef,
        startScaleRef,
        scaleCenterRef
      );
      return;
    }

    // 🔹 회전 조절 중
    if (isRotatingRef.current) {
      RotateMouseMove(
        canvas,
        x,
        y,
        setPlacedObjects,
        activePlacedId,
        startAngleRef,
        startRotateRef
      );
      return;
    }

    // 🔹 드래그 중
    if (isDraggingRef.current) {
      updateCanvasCursor(canvas, "move");
      setPlacedObjects((prev) =>
        prev.map((obj) =>
          obj.id === activePlacedId
            ? {
                ...obj,
                x: x - dragOffsetRef.current.x,
                y: y - dragOffsetRef.current.y,
              }
            : obj
        )
      );
      updateCanvasCursor(canvas, "move");
    }
    updateHoverCursor(canvas, x, y, placedObjects, cutoutCacheRef);
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
    isScalingRef.current = false;
    isRotatingRef.current = false;

    const canvas = bgCanvasRef.current;
    if (canvas) {
      canvas.style.cursor = "default";
    }
  };

  // 배치된 객체 삭제 함수
  const handleDeletePlacedObject = () => {
    if (!activePlacedId) return;

    setPlacedObjects((prev) => prev.filter((obj) => obj.id !== activePlacedId));
    setActivePlacedId(null);

    useToastStore
      .getState()
      .addToast("Object deleted successfully.", "success");
  };

  // 백스페이스 키 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 백스페이스 키이고 activePlacedId가 있을 때만 삭제
      // input이나 textarea에 포커스가 있을 때는 삭제하지 않음
      if (
        e.key === "Backspace" &&
        activePlacedId &&
        !e.target.matches("input, textarea") &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        // 삭제 함수 직접 호출
        setPlacedObjects((prev) =>
          prev.filter((obj) => obj.id !== activePlacedId)
        );
        setActivePlacedId(null);
        useToastStore
          .getState()
          .addToast("Object deleted successfully.", "success");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePlacedId]);

  const handleNext = async () => {
    // 컷아웃 소스가 없으면 에러 메시지 표시
    if (placedObjects.length === 0) {
      useToastStore
        .getState()
        .addToast("Please place at least one object.", "error");
      return;
    }

    // 바운딩 박스 사라지게 하기 (activePlacedId를 null로 설정)
    setActivePlacedId(null);

    // 바운딩 박스가 사라진 후 이미지 생성 (다음 프레임에 실행)
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    const labels = await exportComposite(
      bgCanvasRef.current,
      placedObjects,
      cutoutCacheRef
    );

    // const result = await createSyntheticData(labels);

    // result.imageUrl을 사용하여 이미지 표시
    // 예: <img src={result.imageUrl} />

    navigate(
      `/project/${projectId}/synthetic-data/${taskId}/data-augmentation`
    );
  };

  // 🔹 현재 배경 + 컷아웃 합성 결과 기준으로 bbox 계산 (COCO/YOLO 라벨용)
  const handleExportLabels = () => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    // 세션 스토리지에서 원본 이미지 크기 가져오기
    const cutoutSources =
      JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
    // 첫 번째 항목의 image 크기를 사용 (또는 배경 이미지에 해당하는 항목)
    // 사용자가 "2번 이미지"라고 했으므로 인덱스 1 사용 (0-based)
    const originalImage = cutoutSources[1]?.image || cutoutSources[0]?.image;
    if (!originalImage || !originalImage.width || !originalImage.height) {
      console.error("원본 이미지 크기를 찾을 수 없습니다.");
      return;
    }

    const labels = computeCompositeBBoxes({
      placedObjects,
      cutoutCacheRef,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      originalImageWidth: originalImage.width,
      originalImageHeight: originalImage.height,
      alphaThreshold: 0, // alpha > 0 인 픽셀을 객체로 간주
    });
  };

  const handleAddBackground = (e) => {};

  return (
    <Container onDragOver={(e) => e.preventDefault()}>
      <div>
        <PageHeader title={"Synthetic data"} description={ProjectName} />
        <p className="description">
          Place segmented objects onto backgrounds to build synthetic images.
        </p>
      </div>
      <Main>
        <Sidebar>
          <h3>{ScissorsIcon} Cut-out Source</h3>
          <ul className="image-list">
            {cutouts.map((cutout, index) => (
              <li
                key={index}
                draggable
                className={selectedImage === cutout.id ? "selected" : ""}
                onClick={() => handleSelectCoutout(cutout)}
                onDragStart={(e) => handleDragStart(e, cutout)}
                onDragOver={(e) => e.preventDefault()}
              >
                <canvas
                  width={160}
                  height={160}
                  ref={(el) => {
                    if (el) {
                      drawCutoutThumbnail({
                        canvas: el,
                        cutout,
                        cutoutCacheRef,
                      });
                    }
                  }}
                />
              </li>
            ))}
          </ul>
          <button className="remove-button" onClick={handleDeleteCutout}>
            {RemoveIcon}
            Remove
          </button>
        </Sidebar>
        <section>
          <Header>
            <h3>Background Image</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* 삭제 버튼 (객체 선택 시에만 표시) */}
              {activePlacedId && (
                <DeleteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlacedObject();
                  }}
                  title="Delete object (Backspace)"
                >
                  ×
                </DeleteButton>
              )}
            <button onClick={() => fileInputRef.current.click()}>
              {PlusIcon} Add
            </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const url = URL.createObjectURL(file);
                setBgImage(url);

                setPlacedObjects([]);
                setActivePlacedId(null);
              }}
            />
          </Header>
          <ImageContainer className="image-container">
            <img
              src={bgImage || "/placeholder.png"}
              alt="background"
              className="target-image"
              style={imageStyle}
            />
            <canvas
              ref={bgCanvasRef}
              className="mask-canvas"
              style={imageStyle}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onDragOver={(e) => e.preventDefault()} // 필수
              onDrop={handleCanvasDrop}
            />
          </ImageContainer>
          <footer>
            <Navigation>
              <button
                onClick={() =>
                  navigate(`/project/${projectId}/synthetic-data/${taskId}`)
                }
              >
                {LeftArrowIcon}Prev
              </button>
              <button onClick={() => handleNext()}>{RightArrowIcon}Next</button>
              {/* <button onClick={handleExportLabels}>Export labels</button> */}
            </Navigation>
          </footer>
        </section>
      </Main>
    </Container>
  );
}
