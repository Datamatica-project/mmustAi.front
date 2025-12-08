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
  width: 790px;
  height: 600px;
  position: relative;
  margin-bottom: 20px;
  display: inline-block;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .mask-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* 클릭 이벤트는 이미지가 받도록 */
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

    &:hover {
      background-color: #5b5d75;
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
  const [selectButton, setSelectButton] = useState("Hover & Click");
  const [featherCount, setFeatherCount] = useState(10);
  const [expandCount, setExpandCount] = useState(10);
  const [toggleStatusButton, setToggleStatusButton] = useState("Plus");
  const [toggleToolButton, setToggleToolButton] = useState("Mask");
  const [maskHistory, setMaskHistory] = useState([]); // 히스토리 스택
  const [historyIndex, setHistoryIndex] = useState(-1); // 현재 히스토리
  const [fullMask, setFullMask] = useState(null); // 마스크 상태 저장
  const fullMaskRef = useRef(null);
  const ProjectName = "Project_1";
  const ButtonsOptions = [
    { title: "Hover & Click", icon: CursorIcon },
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

  function mergeMasks(oldMask, newMask, mode = "Plus") {
    const height = newMask.length;
    const width = newMask[0].length;

    // 기존 마스크가 없을 시
    if (!oldMask) {
      // Minus 모드에서는 빼는 대상이 없으므로 빈 마스크 반환
      if (mode === "Minus") {
        return Array.from({ length: height }, () => Array(width).fill(0));
      }
      // Plus 모드에서는 새 마스크 반환
      return newMask.map((row) => [...row]);
    }

    const result = Array.from({ length: height }, () => Array(width).fill(0));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mode === "Plus") {
          result[y][x] = oldMask[y][x] || newMask[y][x] ? 1 : 0;
        } else if (mode === "Minus") {
          result[y][x] = oldMask[y][x] && !newMask[y][x] ? 1 : 0;
        }
      }
    }

    return result;
  }

  // 이미지를 base64로 변환
  function imageToBase64(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL("image/png").split(",")[1];
  }

  // 마스크를 캔버스에 그리기
  function drawMaskOnCanvas(mask, canvas, color = [0, 255, 0, 120]) {
    const ctx = canvas.getContext("2d");
    const height = mask.length;
    const width = mask[0].length;

    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        if (mask[y][x] === 1) {
          data[idx] = color[0]; // R
          data[idx + 1] = color[1]; // G
          data[idx + 2] = color[2]; // B
          data[idx + 3] = color[3]; // Alpha(0~255)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // 클릭 이벤트
  useEffect(() => {
    fullMaskRef.current = fullMask;
    const handleClick = async (e) => {
      if (selectButton !== "Hover & Click") return;

      const rect = e.currentTarget.getBoundingClientRect();
      const targetImage = document.querySelector(".target-image");

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

      try {
        const response = await segmentImage(base64, [[x, y]], [1]);
        const newMask = response.mask;

        // mergeMasks를 한 번만 실행하고 결과를 저장
        const mergedMask = mergeMasks(
          fullMaskRef.current,
          newMask,
          toggleStatusButton
        );

        // 상태 업데이트와 캔버스 그리기에 동일한 결과 사용
        setFullMask(mergedMask);
        drawMaskOnCanvas(mergedMask, document.querySelector(".mask-canvas"));
      } catch (error) {
        console.error(error);
      }
    };

    const imageContainer = document.querySelector(".image-container");
    imageContainer?.addEventListener("click", handleClick);

    return () => {
      imageContainer?.removeEventListener("click", handleClick);
    };
  }, [selectButton, toggleStatusButton, fullMask]);

  return (
    <Container>
      <div>
        <PageHeader title={"Synthetic data"} description={ProjectName} />
        <p className="description">Segment the image to extract objects.</p>
      </div>

      <Main>
        <aside>
          <div className="ToolButtons">
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
          </div>
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
                <button key={index} className="ButtonStyle StepControlButton">
                  {item.icon}
                </button>
              ))}
            </StepControlButtonContainer>
            <button className="ButtonStyle cutOutObjectButton">
              {PatchPlusIcon} Cut out object
            </button>
          </div>
          <AdjustmentSection className="ToolSection">
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
          </AdjustmentSection>
        </aside>
        <section>
          <Header>
            <h3>Image010.jpg</h3>
            <button>{PlusIcon} Add</button>
          </Header>
          <ImageContainer className="image-container">
            <img
              src="/testImg2.jpg"
              alt="placeholder"
              className="target-image"
            />
            <canvas className="mask-canvas" />
          </ImageContainer>
          <footer>
            <Navigation>
              <button>{LeftArrowIcon}Prev</button>
              <button>{RightArrowIcon}Next</button>
            </Navigation>
          </footer>
        </section>
      </Main>
    </Container>
  );
}
