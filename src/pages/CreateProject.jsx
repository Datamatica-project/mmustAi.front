import React, { useState } from "react";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import { LeftArrowIcon } from "../components/icons/Icons";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const PageContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 60px;
`;

const Card = styled.div`
  width: 960px;
  max-width: 100%;
  background-color: #202236;
  border-radius: 12px;
  /* padding: 40px 80px 32px; */
  box-sizing: border-box;
  border: 1px solid #2c2e44;

  .create-project-container {
    width: 460px;
    margin: 0 auto;
    padding: 40px 80px 32px;
  }
`;

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 25px;
  margin-left: 40px;
  margin-bottom: 24px;
  font-size: 14px;

  svg {
    width: 30px;
    height: 30px;
  }
`;

const Title = styled.h2`
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;

  gap: 20px;
  margin-bottom: 16px;

  & > div {
    flex: 1;
    width: 100%;
  }
`;

const Label = styled.label`
  font-size: 12px;
  color: #7b7d95;
  display: none;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  border-radius: 999px;
  border: 1px solid #ea257f;
  background-color: #1c1d2f;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #c3c3c3;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  border-radius: 16px;
  border: 1px solid #ea257f;
  background-color: #1c1d2f;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  resize: none;
  min-height: 72px;

  &::placeholder {
    color: #c3c3c3;
  }
`;

const ClassesBox = styled.div`
  margin-top: 8px;
  border-radius: 10px;
  border: 1px solid #f62579;
  padding: 16px;
  height: 180px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background-color: #151624;
  align-items: flex-start;
`;

const ClassChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
  background-color: ${(props) => props.color || "#3b3c5d"};
  color: #ffffff;
`;

const RemoveChip = styled.button`
  border: none;
  background: transparent;
  color: #eaeaea;
  cursor: pointer;
  font-size: 11px;
`;

const AddRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

const SmallInput = styled(Input)`
  max-width: 220px;
`;

const ColorInput = styled.input`
  width: 44px;
  height: 28px;

  border: 1px solid #3b3c5d;
  background: transparent;
  padding: 0;
  cursor: pointer;
`;

const AddButton = styled.button`
  border-radius: 999px;
  border: none;
  background-color: #f62579;
  color: #ffffff;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const CreateButton = styled.button`
  margin-top: 28px;
  width: 100%;
  border-radius: 999px;
  border: none;
  background-color: #f62579;
  color: #ffffff;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #d41e66;
  }
`;

export default function CreateProject() {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetImages, setTargetImages] = useState("");
  const [imagesPerTask, setImagesPerTask] = useState("");

  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#697689");
  const [classes, setClasses] = useState([
    { name: "car", color: "#8A4A4A" }, // red → 톤 다운
    { name: "truck", color: "#4A5A8A" }, // blue
    { name: "bus", color: "#4A8A5A" }, // green
    { name: "special_vehicle", color: "#4A8A8A" }, // cyan (옵션)
    { name: "motorcycle", color: "#8A4A7A" }, // pink
    { name: "bicycle", color: "#6C4A8A" }, // purple
    { name: "pedestrian", color: "#8A6A4A" }, // orange
    { name: "traffic_sign", color: "#7A5A4A" }, // brown
    { name: "traffic_light", color: "#6A6A6A" }, // gray
  ]);

  const handleAddClass = () => {
    if (!labelName.trim()) return;
    setClasses((prev) => [
      ...prev,
      { name: labelName.trim(), color: labelColor },
    ]);
    setLabelName("");
  };

  const handleRemoveClass = (name) => {
    setClasses((prev) => prev.filter((c) => c.name !== name));
  };

  const handleSubmit = () => {
    const payload = {
      projectName,
      description,
      startDate,
      targetImages,
      imagesPerTask,
      classes,
    };
    console.log("Create project payload:", payload);
    // TODO: 실제 프로젝트 생성 API 호출 후 프로젝트 상세 페이지로 이동
  };

  return (
    <Wrapper>
      {/* <PageHeader title="Create Project" description="Project settings" /> */}
      <PageContainer>
        <Card>
          <BackButton onClick={() => navigate(-1)}>{LeftArrowIcon}</BackButton>
          <div className="create-project-container">
            <Title>Create Project</Title>

            {/* Project Setting */}
            <SectionTitle>Project Setting</SectionTitle>
            <FormRow>
              <div>
                <Label>Project Name</Label>
                <Input
                  placeholder="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label>Project Description</Label>
                <TextArea
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Target Number of Images</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Target Number of Images"
                  value={targetImages}
                  onChange={(e) => setTargetImages(e.target.value)}
                />
              </div>
              <div>
                <Label>Images per Task</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Images per Task"
                  value={imagesPerTask}
                  onChange={(e) => setImagesPerTask(e.target.value)}
                />
              </div>
            </FormRow>

            {/* Define Classes */}
            <SectionTitle>Define Classes</SectionTitle>
            <Label>Label Classes</Label>
            <AddRow>
              <SmallInput
                placeholder="Label Classes"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
              />
              <ColorInput
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
              />
              <AddButton onClick={handleAddClass}>
                <span>＋</span> Add
              </AddButton>
            </AddRow>

            <ClassesBox>
              {classes.map((cls) => (
                <ClassChip key={cls.name} color={cls.color}>
                  <span>{cls.name}</span>
                  <RemoveChip onClick={() => handleRemoveClass(cls.name)}>
                    ✕
                  </RemoveChip>
                </ClassChip>
              ))}
            </ClassesBox>

            <CreateButton onClick={handleSubmit}>Create Project</CreateButton>
          </div>
        </Card>
      </PageContainer>
    </Wrapper>
  );
}
