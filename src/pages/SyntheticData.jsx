import React, { useEffect, useRef, useState } from "react";
import PageHeader from "../components/organisms/PageHeader";
import styled from "styled-components";
import {
  PentagonIcon,
  ScissorsIcon,
  CursorIcon,
  DashIcon,
  PlusIcon,
  PatchPlusIcon,
  UndoIcon,
  ResetIcon,
  RedoIcon,
} from "../components/icons/Project";
import {
  BBoxIcon,
  LeftArrowIcon,
  RightArrowIcon,
} from "../components/icons/Icons";
import ToolSelector from "../components/molecules/ToolSelector";
import ToggleButtons from "../components/molecules/ToggleButtons";
import SlideBar from "../components/molecules/SlideBar";
import CountButtonBox from "../components/molecules/CountButtonBox";
import { segmentImage } from "../api/sam";
import { drawMaskOnCanvas, mergeMasks } from "../utils/maskUtils";
import { imageToBase64, saveMetaData } from "../utils/imageUtils";
import KonvaCanvas from "../components/organisms/KonvaCanvas";
import KonvaBoundingBoxLayer from "../components/organisms/KonvaBoundingBoxLayer";
import { useBboxStore } from "../store/bboxStore";
import ListSection from "../components/molecules/ListSection";
import ClassLabel from "../components/atoms/ClassLabel";
import { classes } from "../data/index.js";
import DropDown from "../components/molecules/DropDown.jsx";
import { useToastStore } from "../store/toastStore.js";
import { useNavigate, useParams } from "react-router-dom";

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

const StepControlButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  .StepControlButton {
    border-radius: 5px;
    background-color: #282943;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    padding: 10px 20px;
    transition: all 0.2s ease;
    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: #3b3c5d;
      color: #ffffff;
    }
  }
`;

const AdjustmentSection = styled.div`
  padding-top: 20px;
  border-top: 2px solid rgba(54, 55, 81, 0.42);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const BoundaryAdjustmentSection = styled.div`
  max-width: 270px;
  width: 100%;
  display: flex;
  flex-direction: column;

  gap: 15px;
  h3 {
    font-size: 15px;
    font-weight: 700;
    color: #5e5f7d;
  }

  .BoundaryAdjustmentItem {
    font-size: 14px;
    font-weight: 500;
    color: #5e5f7d;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
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
    left: 0;
    width: 100%; */
    height: 100%;
    pointer-events: none; /* 클릭 이벤트는 이미지가 받도록 */
  }
`;

// 로딩 오버레이 스타일 컴포넌트
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #f62579;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  text-align: center;
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
export default function SyntheticData() {
  const [tool, setTool] = useState("segmentation");
  const [selectButton, setSelectButton] = useState("Click");
  const [featherCount, setFeatherCount] = useState(10);
  const [expandCount, setExpandCount] = useState(10);
  const [toggleStatusButton, setToggleStatusButton] = useState("Plus");
  const [toggleToolButton, setToggleToolButton] = useState("Mask");
  const [maskHistory, setMaskHistory] = useState([]); // 히스토리 스택
  const [historyIndex, setHistoryIndex] = useState(-1); // 현재 히스토리
  const [fullMask, setFullMask] = useState(null); // 마스크 상태 저장
  const fullMaskRef = useRef(null);
  const { bbox, setBbox } = useBboxStore();
  const ProjectName = "Project_1";
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // 이미지 파일 입력 참조
  const [sgImage, setSgImage] = useState(null); // 이미지 URL 상태
  const [isSegmenting, setIsSegmenting] = useState(false); // 세그멘테이션 요청 중 로딩 상태
  const [imageStyle, setImageStyle] = useState({}); // 이미지 크기 스타일
  const { projectId, taskId } = useParams();

  // 이미지 URL 해제
  useEffect(() => {
    return () => {
      if (sgImage) URL.revokeObjectURL(sgImage);
    };
  }, [sgImage]);

  // 이미지 로드 시 크기에 따라 스타일 설정
  useEffect(() => {
    if (!sgImage) {
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
  }, [sgImage]);

  const ButtonsOptions = [
    { title: "Click", icon: CursorIcon },
    { title: "Bounding Box", icon: BBoxIcon },
  ];

  const ToggleButtonsOptions = [
    { title: "Minus", icon: DashIcon },
    { title: "Plus", icon: PlusIcon },
  ];
  const ToggleButtonsOptions2 = [{ title: "Mask" }, { title: "Outline" }];

  const StepControlButtons = [
    { title: "undo", icon: UndoIcon },
    { title: "reset", icon: ResetIcon },
    { title: "redo", icon: RedoIcon },
  ];

  function handleUndo() {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    const previousMask = maskHistory[newIndex];
    setFullMask(previousMask);
    fullMaskRef.current = previousMask;

    drawMaskOnCanvas(
      previousMask,
      document.querySelector(".mask-canvas"),
      setBbox
    );
  }

  function handleRedo() {
    if (historyIndex >= maskHistory.length - 1) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);

    const nextMask = maskHistory[newIndex];
    setFullMask(nextMask);
    fullMask.current = nextMask;

    drawMaskOnCanvas(nextMask, document.querySelector(".mask-canvas"), setBbox);
  }

  function handleReset() {
    setMaskHistory([]);
    setHistoryIndex(-1);
    setFullMask(null);
    fullMaskRef.current = null;

    const canvas = document.querySelector(".mask-canvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  function convertCanvasToImageCoords(canvasX, canvasY, img, containerRect) {
    // canvasX : 화면 전체 기준 좌표
    // canvasY : 화면 전체 기준 좌표
    // containerRect : 컨테이너 영역 정보
    // img : 이미지 정보

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight; // 원본 이미지 크기 1920 * 1389

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height; // 컨테이너 영역 크기 790 * 600

    const relativeX = canvasX - containerRect.left; // 컨테이너 기준 바운딩 박스 좌표
    const relativeY = canvasY - containerRect.top;

    const imageRatio = naturalWidth / naturalHeight;
    const containerRatio = containerWidth / containerHeight;

    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imageRatio > containerRatio) {
      // 가로가 긴 이미지 → 세로 padding
      displayedWidth = containerWidth;
      displayedHeight = containerWidth / imageRatio;
      offsetX = 0;
      offsetY = (containerHeight - displayedHeight) / 2;
    } else {
      // 세로가 긴 이미지 → 좌우 padding
      displayedHeight = containerHeight;
      displayedWidth = containerHeight * imageRatio;
      offsetX = (containerWidth - displayedWidth) / 2;
      offsetY = 0;
    }

    // 1. 바운딩 박스 좌표를 이미지 영역 기준으로 변환
    const imageAreaX = relativeX - offsetX;
    const imageAreaY = relativeY - offsetY;

    // 2. 원본 이미지 크기로 스케일링
    let imageX = imageAreaX * (naturalWidth / displayedWidth);
    let imageY = imageAreaY * (naturalHeight / displayedHeight);

    if (imageX < 0) imageX = 0;
    if (imageY < 0) imageY = 0;
    if (imageX > naturalWidth) imageX = naturalWidth;
    if (imageY > naturalHeight) imageY = naturalHeight;

    return { x: imageX, y: imageY };
  }

  function handleMaskFromBbox(newMask) {
    if (selectButton !== "Bounding Box") return;
    const merged = mergeMasks(fullMaskRef.current, newMask, toggleStatusButton);

    setMaskHistory((prev) => [...prev, merged]);
    setHistoryIndex((prev) => prev + 1);
    setFullMask(merged);

    drawMaskOnCanvas(merged, document.querySelector(".mask-canvas"), setBbox);
  }

  function handleCutout(fullMask) {
    if (!selectedClass) {
      useToastStore.getState().addToast("Please select a class", "error");
      return;
    }
    saveMetaData(selectedClass, bbox, fullMask);
    handleReset();
    useToastStore.getState().addToast("Cutout saved", "success");
  }

  // 클릭 이벤트
  useEffect(() => {
    fullMaskRef.current = fullMask;
    const handleClick = async (e) => {
      if (selectButton !== "Click") return;
      if (!sgImage) return; // 이미지가 없으면 처리하지 않음

      const rect = e.currentTarget.getBoundingClientRect();
      const targetImage = document.querySelector(".target-image");

      // targetImage가 없거나 placeholder 이미지인 경우 처리하지 않음
      if (!targetImage || targetImage.src.includes("placeholder.png")) return;

      const containerWidth = rect.width;
      const containerHeight = rect.height;

      const imageRatio = targetImage.naturalWidth / targetImage.naturalHeight;
      const containerRatio = containerWidth / containerHeight;

      let displayedWidth, displayedHeight, offsetX, offsetY;

      if (imageRatio > containerRatio) {
        // 가로가 더 길어서 상하에 padding 발생
        displayedWidth = containerWidth;
        displayedHeight = containerWidth / imageRatio;
        offsetX = 0;
        offsetY = (containerHeight - displayedHeight) / 2;
      } else {
        // 세로가 더 길어서 좌우에 padding 발생
        displayedHeight = containerHeight;
        displayedWidth = containerHeight * imageRatio;
        offsetX = (containerWidth - displayedWidth) / 2;
        offsetY = 0;
      }

      const x =
        (e.clientX - rect.left - offsetX) *
        (targetImage.naturalWidth / displayedWidth);
      const y =
        (e.clientY - rect.top - offsetY) *
        (targetImage.naturalHeight / displayedHeight);
      const base64 = imageToBase64(targetImage);

      // 세그멘테이션 요청 시작 - 로딩 상태 활성화
      setIsSegmenting(true);
      try {
        const response = await segmentImage(base64, [[x, y]], [1]);
        const newMask = response.mask;

        // mergeMasks를 한 번만 실행하고 결과를 저장
        const mergedMask = mergeMasks(
          fullMaskRef.current,
          newMask,
          toggleStatusButton
        );

        // 히스토리 스택 업데이트
        setMaskHistory((prev) => {
          const newHistory = prev.slice(0, historyIndex + 1); // redo 내용 잘라냄
          newHistory.push(mergedMask);
          return newHistory;
        });

        setHistoryIndex((prev) => prev + 1);
        // 상태 업데이트와 캔버스 그리기에 동일한 결과 사용
        setFullMask(mergedMask);
        drawMaskOnCanvas(
          mergedMask,
          document.querySelector(".mask-canvas"),
          setBbox
        );
      } catch (error) {
        console.error(error);
        useToastStore.getState().addToast("Segmentation failed", "error");
      } finally {
        // 요청 완료 후 로딩 상태 비활성화 (성공/실패 모두)
        setIsSegmenting(false);
      }
    };

    const imageContainer = document.querySelector(".image-container");
    imageContainer?.addEventListener("click", handleClick);

    return () => {
      imageContainer?.removeEventListener("click", handleClick);
    };
  }, [selectButton, toggleStatusButton, fullMask, sgImage]);

  return (
    <Container>
      <div>
        <PageHeader title={"Synthetic data"} description={ProjectName} />
        <p className="description">Segment the image to extract objects.</p>
      </div>

      <Main>
        <aside>
          {/* <div className="ToolButtons">
            <button
              className={`ButtonStyle ${
                tool === "segmentation" ? "active" : ""
              }`}
              onClick={() => setTool("segmentation")}
            >
              {PentagonIcon} Segmentation
            </button>
            <button
              className={`ButtonStyle ${
                tool === "cut-out-preview" ? "active" : ""
              }`}
              onClick={() => setTool("cut-out-preview")}
            >
              {ScissorsIcon} Cut-out Preview
            </button>
          </div> */}
          <div className="ToolSection">
            <ToolSelector
              buttons={ButtonsOptions}
              currentValue={selectButton}
              onChange={setSelectButton}
            />
            <ToggleButtons
              name={ToggleButtonsOptions}
              currentValue={toggleStatusButton}
              onChange={setToggleStatusButton}
            />
            <StepControlButtonContainer>
              {StepControlButtons.map((item, index) => (
                <button
                  key={index}
                  className="ButtonStyle StepControlButton"
                  onClick={() => {
                    if (item.title === "undo") handleUndo();
                    else if (item.title === "reset") handleReset();
                    else if (item.title === "redo") handleRedo();
                  }}
                >
                  {item.icon}
                </button>
              ))}
            </StepControlButtonContainer>
            {/* 클래스 선택 */}
            <DropDown
              classes={classes}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
            />
            <button
              className="ButtonStyle cutOutObjectButton"
              onClick={() => handleCutout(fullMask)}
            >
              {PatchPlusIcon} Save Cutout
            </button>
          </div>

          {/* <AdjustmentSection className="ToolSection">
            <ToggleButtons
              name={ToggleButtonsOptions2}
              currentValue={toggleToolButton}
              onChange={setToggleToolButton}
            />
            <SlideBar />
            <BoundaryAdjustmentSection>
              <h3>Boundary Adjustment</h3>
              <div className="BoundaryAdjustmentItem">
                <span>Feather</span>
                <CountButtonBox
                  count={featherCount}
                  setCount={setFeatherCount}
                />
              </div>
              <div className="BoundaryAdjustmentItem">
                <span>Expand</span>
                <CountButtonBox count={expandCount} setCount={setExpandCount} />
              </div>
            </BoundaryAdjustmentSection>
          </AdjustmentSection> */}
        </aside>
        <section>
          <Header>
            <h3>Segmentation Cutout</h3>
            <button onClick={() => fileInputRef.current.click()}>
              {PlusIcon} Add
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const url = URL.createObjectURL(file);
                setSgImage(url);
              }}
            />
          </Header>
          <ImageContainer className="image-container">
            <img
              src={sgImage || "/placeholder.png"}
              alt="segmantation image"
              className="target-image"
              style={imageStyle}
            />
            <canvas className="mask-canvas" style={imageStyle} />
            {selectButton === "Bounding Box" && (
              <KonvaBoundingBoxLayer
                width={790}
                height={600}
                onSelect={(box) => handleMaskFromBbox(box)}
                convertCanvasToImageCoords={convertCanvasToImageCoords}
                imageToBase64={imageToBase64}
                setIsSegmenting={setIsSegmenting}
              />
            )}
            {/* 세그멘테이션 요청 중 로딩 오버레이 표시 */}
            {isSegmenting && (
              <LoadingOverlay>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <LoadingSpinner />
                  <LoadingText>Segmenting...</LoadingText>
                </div>
              </LoadingOverlay>
            )}
          </ImageContainer>
          <footer>
            <Navigation>
              <button onClick={() => navigate(`/project/${projectId}`)}>
                {LeftArrowIcon}Prev
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/project/${projectId}/synthetic-data/${taskId}/background`
                  )
                }
              >
                {RightArrowIcon}Next
              </button>
            </Navigation>
          </footer>
        </section>
      </Main>
    </Container>
  );
}
