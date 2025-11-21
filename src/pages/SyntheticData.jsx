import React, { useState } from "react";
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
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  const [toggleStatusButton, setToggleStatusButton] = useState("Minus");
  const [toggleToolButton, setToggleToolButton] = useState("Mask");
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
  return (
    <Container>
      <div>
        <PageHeader title={"Synthetic data"} description={ProjectName} />
        <p className="description">Segment the image to extract objects."</p>
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
            <img src="https://picsum.photos/800/600" alt="placeholder" />
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
