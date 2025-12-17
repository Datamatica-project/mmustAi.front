import React, { useEffect } from "react";
import { useRef, useState } from "react";
import PageHeader from "../components/organisms/PageHeader";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { LeftArrowIcon, RightArrowIcon } from "../components/icons/Icons";
import { PlusIcon, ScissorsIcon } from "../components/icons/Project";
import {
  cutoutDB,
  drawCutoutOnBackground,
  drawCutoutThumbnail,
  getMaskFromIndexedDB,
} from "../utils/indexDB";

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
`;

export default function SyntheticBackground() {
  const ProjectName = "Project_1";
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cutouts, setCutouts] = useState([]); // 이미지 메타데이터
  const bgCanvasRef = useRef(null); // 배경 캔버스 참조
  // 사이드바에서 선택된 컷아웃 (아직 배치 안 됨)
  const [activeCutout, setActiveCutout] = useState(null);
  // 실제 배경에 배치된 객체들
  const [placedObjects, setPlacedObjects] = useState([]);

  const isPlacingRef = useRef(false);
  const dragPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // 캔버스 크기 === 이미지 크기로 조정
    const canvas = bgCanvasRef.current;
    const img = document.querySelector(".target-image");
    if (!canvas || !img) return;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
  }, [bgImage]);

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

    // 배경 캔버스에 컷아웃 그리기
    placedObjects.forEach((obj) => {
      drawCutoutOnBackground({
        canvas,
        cutout: obj,
        transform: obj,
      });
    });
  }, [placedObjects, bgImage]);

  // 썸네일 이미지 클릭
  const handleSelectCoutout = (cutout) => {
    setSelectedImage(cutout.id);

    // 컷아웃 추가 State
    // setPlacedObjects((prev) => [
    //   ...prev,
    //   {
    //     id: cutout.id,
    //     classId: cutout.classId,
    //     bbox: cutout.bbox,
    //     x: 30,
    //     y: 30,
    //     scale: 0.3,
    //     rotate: 0,
    //   },
    // ]);
    setActiveCutout(cutout);
  };

  const handleDeleteCutout = async () => {
    if (!activeCutout) return;

    const id = activeCutout.id;

    // 1️⃣ sessionStorage 삭제
    const prev = JSON.parse(sessionStorage.getItem("cutoutSources")) || [];
    const next = prev.filter((c) => c.id !== id);
    sessionStorage.setItem("cutoutSources", JSON.stringify(next));
    setCutouts(next);

    // 2️⃣ IndexedDB 삭제
    await cutoutDB.delete("images", id);
    await cutoutDB.delete("masks", id);

    // 3️⃣ 배경에 배치된 객체도 제거
    setPlacedObjects((prev) => prev.filter((obj) => obj.sourceId !== id));

    // 4️⃣ 선택 해제
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
  const handleCanvasDrop = (e) => {
    e.preventDefault();

    const data = e.dataTransfer.getData("application/cutout");
    if (!data) return;

    const cutout = JSON.parse(data);

    const canvas = bgCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = 0.3;
    const { bbox } = cutout;

    const width = bbox.width * scale;
    const height = bbox.height * scale;

    const x = mouseX - width / 2;
    const y = mouseY - height / 2;

    setPlacedObjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sourceId: cutout.id,
        classId: cutout.classId,
        bbox,
        x,
        y,
        scale,
        rotate: 0,
      },
    ]);
  };

  return (
    <Container>
      <div>
        <PageHeader title={"Synthetic data"} description={ProjectName} />
        <p className="description">Segment the image to extract objects.</p>
      </div>
      <Main>
        <Sidebar>
          <h3>{ScissorsIcon} Cut-out Source</h3>
          <ul className="image-list">
            {cutouts.map((cutout, index) => (
              <li
                key={index}
                draggable={true}
                className={selectedImage === cutout.id ? "selected" : ""}
                onClick={() => handleSelectCoutout(cutout)}
                onDragStart={(e) => handleDragStart(e, cutout)}
              >
                <canvas
                  width={160}
                  height={160}
                  ref={(el) => {
                    if (el) {
                      drawCutoutThumbnail(el, cutout);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
          <button onClick={handleDeleteCutout}>Remove</button>
        </Sidebar>
        <section>
          <Header>
            <h3>Image010.jpg</h3>
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
                setBgImage(url);
              }}
            />
          </Header>
          <ImageContainer className="image-container">
            <img
              src={bgImage || "/testImg2.jpg"}
              alt="background"
              className="target-image"
            />
            <canvas
              ref={bgCanvasRef}
              className="mask-canvas"
              //   onMouseDown={handleCanvasMouseDown}
              //   onMouseMove={handleCanvasMouseMove}
              //   onMouseUp={handleCanvasMouseUp}

              onDragOver={(e) => e.preventDefault()} // 필수
              onDrop={handleCanvasDrop}
            />
          </ImageContainer>
          <footer>
            <Navigation>
              <button onClick={() => navigate("/synthetic-data/")}>
                {LeftArrowIcon}Prev
              </button>
              <button>{RightArrowIcon}Next</button>
            </Navigation>
          </footer>
        </section>
      </Main>
    </Container>
  );
}
