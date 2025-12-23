import React, { useState, useRef } from "react";
import styled from "styled-components";
import PageHeader from "../components/organisms/PageHeader";
import { LeftArrowIcon } from "../components/icons/Icons";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/Project";
import {
  createFileChunks,
  uploadFile,
  uploadMultipleFiles,
} from "../utils/uploadUtils";
import { useToastStore } from "../store/toastStore";
import { uploadFilesUnified } from "../api/File";
import { ChunkUploadCalculator } from "../utils/chunkCalculator";

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
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
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
  box-sizing: border-box;
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

  &:disabled {
    background-color: #5b5d75;
    cursor: not-allowed;
  }
`;

const UploadSection = styled.div`
  margin-bottom: 24px;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$active ? "#f62579" : "#3b3c5d")};
  background-color: ${(props) => (props.$active ? "#f62579" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#b6b5c5")};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #f62579;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${(props) => (props.$dragging ? "#f62579" : "#3b3c5d")};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background-color: ${(props) => (props.$dragging ? "#2a1b2d" : "#151624")};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #f62579;
    background-color: #2a1b2d;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadText = styled.div`
  color: #b6b5c5;
  font-size: 14px;
  margin-top: 10px;
`;

const FileList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #1c1d2f;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #3b3c5d;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #f62579;
  transition: width 0.3s ease;
  width: ${(props) => props.$progress || 0}%;
`;

const FileStatus = styled.span`
  font-size: 11px;
  color: ${(props) => {
    if (props.$status === "success") return "#46eb83";
    if (props.$status === "error") return "#f62579";
    return "#b6b5c5";
  }};
`;

const RemoveFileButton = styled.button`
  border: none;
  background: transparent;
  color: #f62579;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  margin-left: 8px;
`;

export default function CreateProject() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [imagesPerTask, setImagesPerTask] = useState("");

  // 업로드 관련 상태
  const [uploadMethod, setUploadMethod] = useState("individual"); // "individual" | "zip"
  const [uploadFiles, setUploadFiles] = useState([]); // { file, fileId, progress, status }
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#697689");
  const [classes, setClasses] = useState([
    { name: "car", hexColor: "#8A4A4A" }, // red → 톤 다운
    { name: "truck", hexColor: "#4A5A8A" }, // blue
    { name: "bus", hexColor: "#4A8A5A" }, // green
    { name: "special_vehicle", hexColor: "#4A8A8A" }, // cyan (옵션)
    { name: "motorcycle", hexColor: "#8A4A7A" }, // pink
    { name: "bicycle", hexColor: "#6C4A8A" }, // purple
    { name: "pedestrian", hexColor: "#8A6A4A" }, // orange
    { name: "traffic_sign", hexColor: "#7A5A4A" }, // brown
    { name: "traffic_light", hexColor: "#6A6A6A" }, // gray
  ]);

  const handleAddClass = () => {
    if (!labelName.trim()) return;
    setClasses((prev) => [
      ...prev,
      { name: labelName.trim(), hexColor: labelColor },
    ]);
    setLabelName("");
  };

  const handleRemoveClass = (name) => {
    setClasses((prev) => prev.filter((c) => c.name !== name));
  };

  // 파일 선택 처리
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map((file) => ({
      file,
      fileId: null,
      progress: 0,
      status: "pending", // pending, uploading, success, error
    }));
    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  // 개별 파일 선택
  const handleIndividualFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    e.target.value = ""; // 같은 파일 재선택 가능하도록
  };

  // ZIP 파일 선택
  const handleZipFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const zipFile = files[0];
      if (!zipFile.name.endsWith(".zip")) {
        useToastStore
          .getState()
          .addToast("ZIP 파일만 업로드 가능합니다.", "error");
        return;
      }
      handleFileSelect([zipFile]);
    }
    e.target.value = "";
  };

  // 드래그 앤 드롭
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (uploadMethod === "individual") {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        handleFileSelect(files);
      }
    } else {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.name.endsWith(".zip")
      );
      if (files.length > 0) {
        handleFileSelect(files);
      }
    }
  };

  // 파일 업로드 시작
  const handleStartUpload = async () => {
    if (uploadFiles.length === 0) {
      useToastStore
        .getState()
        .addToast("업로드할 파일을 선택해주세요.", "error");
      return;
    }

    setIsUploading(true);

    try {
      // 통합 업로드 API 사용 (개별 파일과 ZIP 파일 모두 동일한 방식)
      const files = uploadFiles.map((item) => item.file);

      // 각 파일에 대해 순차적으로 업로드 처리
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];

        try {
          // 진행률 업데이트 (업로드 시작)
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? { ...item, progress: 0, status: "uploading" }
                : item
            )
          );

          // 통합 업로드 API 호출
          const response = await uploadFilesUnified(
            [file],
            "PROJECT",
            (progressFileIndex, progress) => {
              // 진행률 업데이트
              setUploadFiles((prev) =>
                prev.map((item, index) =>
                  index === fileIndex
                    ? { ...item, progress, status: "uploading" }
                    : item
                )
              );
            }
          );

          // 응답에서 fileId 추출 (successFileIds 배열의 첫 번째 요소 사용)
          const fileId =
            response.data?.successFileIds?.[0] ||
            response.data?.fileIds?.[0] ||
            response.data?.fileId ||
            response.fileId;

          // fileId 업데이트 (해당 파일만)
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? {
                    ...item,
                    fileId: fileId,
                    status: "success",
                    progress: 100,
                  }
                : item
            )
          );
        } catch (error) {
          console.error(
            `File ${fileIndex} (${file.name}) upload failed:`,
            error
          );
          // 해당 파일을 에러 상태로 표시
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex ? { ...item, status: "error" } : item
            )
          );
        }
      }

      // 모든 파일 업로드 완료
      const successCount = uploadFiles.filter(
        (item) => item.status === "success"
      ).length;
      if (successCount > 0) {
        useToastStore
          .getState()
          .addToast(`${successCount}개 파일 업로드 완료`, "success");
      }
    } catch (error) {
      console.error("Upload error:", error);
      useToastStore
        .getState()
        .addToast("업로드 중 오류가 발생했습니다.", "error");
      setUploadFiles((prev) =>
        prev.map((item) => ({
          ...item,
          status: item.status === "uploading" ? "error" : item.status,
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 제거
  const handleRemoveFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // 업로드된 fileId 추출
    const uploadedFileIds = uploadFiles
      .filter((item) => item.status === "success" && item.fileId)
      .map((item) => item.fileId);

    if (uploadedFileIds.length === 0) {
      useToastStore
        .getState()
        .addToast("최소 1개 이상의 파일을 업로드해주세요.", "error");
      return;
    }

    const payload = {
      projectName,
      description,
      startDate,
      imagesPerTask,
      classes,
      uploadedFileIds,
    };

    try {
      const response = await createProject(payload);

      if (response.resultCode === "SUCCESS") {
        useToastStore
          .getState()
          .addToast("프로젝트가 생성되었습니다.", "success");
        navigate(-1);
      }
    } catch (error) {
      console.error("Create project error:", error);
      useToastStore
        .getState()
        .addToast("프로젝트 생성 중 오류가 발생했습니다.", "error");
    }
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
                <Label>Images per Task (최대 1000)</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  placeholder="Images per Task"
                  value={imagesPerTask}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 최대값 1000 제한
                    if (
                      value === "" ||
                      (Number(value) >= 1 && Number(value) <= 1000)
                    ) {
                      setImagesPerTask(value);
                    }
                  }}
                />
              </div>
            </FormRow>

            {/* Image Upload Section */}
            <SectionTitle>Image Upload</SectionTitle>
            <UploadSection>
              <TabButtons>
                <TabButton
                  $active={uploadMethod === "individual"}
                  onClick={() => setUploadMethod("individual")}
                >
                  개별 파일 선택
                </TabButton>
                <TabButton
                  $active={uploadMethod === "zip"}
                  onClick={() => setUploadMethod("zip")}
                >
                  ZIP 파일 업로드
                </TabButton>
              </TabButtons>

              <UploadArea
                $dragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (uploadMethod === "individual") {
                    fileInputRef.current?.click();
                  } else {
                    zipInputRef.current?.click();
                  }
                }}
              >
                <UploadInput
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleIndividualFileChange}
                />
                <UploadInput
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleZipFileChange}
                />
                <div
                  style={{
                    fontSize: "16px",
                    color: "#ffffff",
                    marginBottom: "8px",
                  }}
                >
                  {uploadMethod === "individual"
                    ? "📁 이미지 파일을 선택하거나 드래그하세요"
                    : "📦 ZIP 파일을 선택하거나 드래그하세요"}
                </div>
                <UploadText>
                  {uploadMethod === "individual"
                    ? "여러 이미지 파일을 한 번에 선택할 수 있습니다"
                    : "압축된 이미지 파일을 업로드합니다"}
                </UploadText>
              </UploadArea>

              {uploadFiles.length > 0 && (
                <>
                  <FileList>
                    {uploadFiles.map((item, index) => (
                      <FileItem key={index}>
                        <FileInfo>
                          <FileName>{item.file.name}</FileName>
                          <ProgressBar>
                            <ProgressFill $progress={item.progress} />
                          </ProgressBar>
                          <FileStatus $status={item.status}>
                            {item.status === "pending" && "대기 중"}
                            {item.status === "uploading" &&
                              `업로드 중... ${item.progress}%`}
                            {item.status === "success" && "완료"}
                            {item.status === "error" && "실패"}
                          </FileStatus>
                        </FileInfo>
                        <RemoveFileButton
                          onClick={() => handleRemoveFile(index)}
                        >
                          ✕
                        </RemoveFileButton>
                      </FileItem>
                    ))}
                  </FileList>
                  {uploadFiles.some((item) => item.status === "pending") && (
                    <AddButton
                      onClick={handleStartUpload}
                      disabled={isUploading}
                      style={{ marginTop: "12px", width: "100%" }}
                    >
                      {isUploading ? "업로드 중..." : "업로드 시작"}
                    </AddButton>
                  )}
                </>
              )}
            </UploadSection>

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
                <ClassChip key={cls.name} color={cls.hexColor}>
                  <span>{cls.name}</span>
                  <RemoveChip onClick={() => handleRemoveClass(cls.name)}>
                    ✕
                  </RemoveChip>
                </ClassChip>
              ))}
            </ClassesBox>

            <CreateButton
              onClick={handleSubmit}
              disabled={
                !projectName ||
                uploadFiles.filter((item) => item.status === "success")
                  .length === 0 ||
                classes.length === 0
              }
            >
              Create Project
            </CreateButton>
          </div>
        </Card>
      </PageContainer>
    </Wrapper>
  );
}
