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
import { generateUUID } from "../utils/generateUUID";
import JSZip from "jszip";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enUS } from "date-fns/locale";

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

// DatePicker를 기존 Input 스타일과 동일하게 맞추기 위한 스타일드 컴포넌트
const StyledDatePicker = styled(DatePicker)`
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ea257f;
  background-color: #1c1d2f;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  font-family: inherit;

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
  const [startDate, setStartDate] = useState(null); // Date 객체로 변경
  const [imagesPerTask, setImagesPerTask] = useState("");

  // Upload related state
  const [uploadMethod, setUploadMethod] = useState("individual"); // "individual" | "zip"
  const [uploadFiles, setUploadFiles] = useState([]); // { file, fileId, progress, status }
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#697689");
  const [classes, setClasses] = useState([
    { name: "car", hexColor: "#8A4A4A", classId: 0 }, // red → tone down
    { name: "truck", hexColor: "#4A5A8A", classId: 1 }, // blue
    { name: "bus", hexColor: "#4A8A5A", classId: 2 }, // green
    { name: "special_vehicle", hexColor: "#4A8A8A", classId: 3 }, // cyan (optional)
    { name: "motorcycle", hexColor: "#8A4A7A", classId: 4 }, // pink
    { name: "bicycle", hexColor: "#6C4A8A", classId: 5 }, // purple
    { name: "pedestrian", hexColor: "#8A6A4A", classId: 6 }, // orange
    { name: "traffic_sign", hexColor: "#7A5A4A", classId: 7 }, // brown
    { name: "traffic_light", hexColor: "#6A6A6A", classId: 8 }, // gray
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

  // 랜덤 영어 파일명 생성 함수 (한글 제거, 확장자 유지)
  const generateRandomFileName = (originalFileName) => {
    // 원본 파일의 확장자 추출
    const extension = originalFileName.includes(".")
      ? originalFileName.substring(originalFileName.lastIndexOf("."))
      : "";

    // 랜덤 문자열 생성 (UUID를 사용하되 하이픈 제거하여 더 짧게)
    const randomString = generateUUID().replace(/-/g, "");

    // 파일명: 랜덤문자열_타임스탬프 + 확장자
    return `${randomString}_${Date.now()}${extension}`;
  };

  // ZIP 파일 내부 파일명 변경 처리
  const processZipFile = async (file) => {
    try {
      // JSZip으로 ZIP 파일 읽기
      const zip = await JSZip.loadAsync(file);
      const newZip = new JSZip();

      // ZIP 내부의 모든 파일 순회
      const filePromises = [];
      zip.forEach((relativePath, zipEntry) => {
        // 디렉토리는 건너뛰기
        if (zipEntry.dir) return;

        // 파일명 추출
        const fileName = relativePath.split("/").pop();
        const extension = fileName.includes(".")
          ? fileName.substring(fileName.lastIndexOf("."))
          : "";

        // 랜덤 영어 파일명 생성
        const randomFileName = generateRandomFileName(fileName);

        // 경로 구조 유지 (디렉토리가 있는 경우)
        const pathParts = relativePath.split("/");
        pathParts[pathParts.length - 1] = randomFileName;
        const newPath = pathParts.join("/");

        // 파일 데이터를 새 ZIP에 추가 (변경된 파일명으로)
        filePromises.push(
          zipEntry.async("blob").then((blob) => {
            newZip.file(newPath, blob);
          })
        );
      });

      // 모든 파일 처리 완료 대기
      await Promise.all(filePromises);

      // 새로운 ZIP 파일 생성
      const zipBlob = await newZip.generateAsync({ type: "blob" });
      const processedZipFile = new File([zipBlob], file.name, {
        type: "application/zip",
        lastModified: file.lastModified,
      });

      return processedZipFile;
    } catch (error) {
      console.error("ZIP 파일 처리 실패:", error);
      useToastStore
        .getState()
        .addToast("ZIP 파일 처리 중 오류가 발생했습니다.", "error");
      // 실패 시 원본 파일 반환
      return file;
    }
  };

  // Handle file selection
  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const newFiles = await Promise.all(
      fileArray.map(async (file) => {
        // 원본 파일명 저장 (UI 표시용)
        const originalFileName = file.name;

        let processedFile = file;

        // ZIP 파일인 경우 내부 파일명 변경 처리
        if (file.name.endsWith(".zip")) {
          processedFile = await processZipFile(file);
        } else {
          // 개별 파일인 경우 파일명 변경
          const randomFileName = generateRandomFileName(originalFileName);
          processedFile = new File([file], randomFileName, {
            type: file.type,
            lastModified: file.lastModified,
          });
        }

        return {
          file: processedFile, // 처리된 File 객체 사용
          originalFileName, // UI 표시용 원본 파일명 저장
          fileId: null,
          progress: 0,
          status: "pending", // pending, uploading, success, error
        };
      })
    );
    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  // Handle individual file selection
  const handleIndividualFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files);
    }
    e.target.value = ""; // Allow reselecting the same file
  };

  // Handle ZIP file selection
  const handleZipFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const zipFile = files[0];
      if (!zipFile.name.endsWith(".zip")) {
        useToastStore
          .getState()
          .addToast("Only ZIP files can be uploaded.", "error");
        return;
      }
      await handleFileSelect([zipFile]);
    }
    e.target.value = "";
  };

  // Drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (uploadMethod === "individual") {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        await handleFileSelect(files);
      }
    } else {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.name.endsWith(".zip")
      );
      if (files.length > 0) {
        await handleFileSelect(files);
      }
    }
  };

  // Start file upload
  const handleStartUpload = async () => {
    if (uploadFiles.length === 0) {
      useToastStore
        .getState()
        .addToast("Please select files to upload.", "error");
      return;
    }

    setIsUploading(true);

    try {
      // Use unified upload API (same method for both individual files and ZIP files)
      const files = uploadFiles.map((item) => item.file);

      // Process uploads sequentially for each file
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];

        try {
          // Update progress (upload started)
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? { ...item, progress: 0, status: "uploading" }
                : item
            )
          );

          // Call unified upload API
          const response = await uploadFilesUnified(
            [file],
            "PROJECT",
            (progressFileIndex, progress) => {
              // Update progress
              setUploadFiles((prev) =>
                prev.map((item, index) =>
                  index === fileIndex
                    ? { ...item, progress, status: "uploading" }
                    : item
                )
              );
            }
          );
          console.log("response", response);

          // ZIP 파일인지 확인
          const isZipFile = file.name.endsWith(".zip");

          // ZIP 파일과 개별 파일 구분 처리
          let fileId = null;
          if (isZipFile) {
            // ZIP 파일: successFileIds 전체 배열 사용 (여러 개의 파일 ID)
            const successFileIds =
              response.data?.successFileIds || response.data?.fileIds || [];
            fileId = successFileIds.length > 0 ? successFileIds : null;
            console.log("ZIP file - extracted fileIds:", fileId);
          } else {
            // 개별 파일: 첫 번째 파일 ID만 사용
            fileId =
              response.data?.successFileIds?.[0] ||
              response.data?.fileIds?.[0] ||
              response.data?.fileId ||
              response.fileId;
            console.log("Individual file - fileId:", fileId);
          }

          // Update fileId (for this file only)
          // ZIP 파일의 경우 fileId는 배열, 개별 파일의 경우 단일 값
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? {
                    ...item,
                    fileId: fileId, // ZIP: 배열, 개별: 단일 값
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
          // Mark file as error status
          setUploadFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex ? { ...item, status: "error" } : item
            )
          );
        }
      }

      // All file uploads completed
      const successCount = uploadFiles.filter(
        (item) => item.status === "success"
      ).length;
      if (successCount > 0) {
        useToastStore
          .getState()
          .addToast(`${successCount} file(s) uploaded successfully`, "success");
      }
    } catch (error) {
      console.error("Upload error:", error);
      useToastStore
        .getState()
        .addToast("An error occurred during upload.", "error");
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

  // Remove file
  const handleRemoveFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Extract uploaded fileIds
    // ZIP 파일의 경우 fileId가 배열이므로 flatMap으로 펼쳐서 모든 파일 ID 수집
    // 개별 파일의 경우 fileId가 단일 값이므로 배열로 변환
    const uploadedFileIds = uploadFiles
      .filter((item) => item.status === "success")
      .flatMap((item) => {
        // fileId가 배열인 경우 (ZIP 파일) 그대로 사용
        if (Array.isArray(item.fileId)) {
          return item.fileId;
        }
        // fileId가 단일 값인 경우 (개별 파일) 배열로 변환
        return item.fileId ? [item.fileId] : [];
      });

    console.log("uploadFiles:", uploadFiles);
    console.log("uploadedFileIds:", uploadedFileIds);

    if (uploadedFileIds.length === 0) {
      useToastStore
        .getState()
        .addToast("Please upload at least one file.", "error");
      return;
    }
    // Convert startDate (Date 객체) to "YYYY-MM-DDT23:59:59" format (including last time of date)
    let formattedStartDate = null;
    if (startDate) {
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const day = String(startDate.getDate()).padStart(2, "0");
      formattedStartDate = `${year}-${month}-${day}T23:59:59`;
    }

    const classesWithClassId = classes.map((cls) => ({
      name: cls.name,
      hexColor: cls.hexColor,
      classId: cls.classId,
    }));
    console.log(classes);
    const payload = {
      projectName,
      description,
      startDate: formattedStartDate,
      imagesPerTask,
      classes,
      uploadedFileIds,
    };

    try {
      const response = await createProject(payload);

      if (response.resultCode === "SUCCESS") {
        useToastStore
          .getState()
          .addToast("Project created successfully.", "success");
        navigate(-1);
      }
    } catch (error) {
      console.error("Create project error:", error);
      useToastStore
        .getState()
        .addToast("An error occurred while creating the project.", "error");
    }
  };

  return (
    <Wrapper>
      {/* DatePicker 캘린더 스타일 커스터마이징 */}
      <style>{`
        .date-picker-calendar {
          background-color: #202236 !important;
          border: 1px solid #ea257f !important;
          border-radius: 10px !important;
          font-family: inherit !important;
        }
        
        .react-datepicker__header {
          background-color: #1c1d2f !important;
          border-bottom: 1px solid #3b3c5d !important;
          border-top-left-radius: 10px !important;
          border-top-right-radius: 10px !important;
        }
        
        .react-datepicker__current-month {
          color: #ffffff !important;
          font-weight: 700 !important;
        }
        
        .react-datepicker__day-name {
          color: #b6b5c5 !important;
        }
        
        .react-datepicker__day {
          color: #ffffff !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #3b3c5d !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--selected {
          background-color: #f62579 !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #f62579 !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--today {
          font-weight: 700 !important;
        }
        
        .react-datepicker__navigation {
          top: 10px !important;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: #ffffff !important;
        }
        
        .react-datepicker__triangle {
          display: none !important;
        }
      `}</style>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // 최대 50자까지만 입력 가능
                    if (value.length <= 50) {
                      setProjectName(value);
                    }
                  }}
                  maxLength={50}
                  minLength={2}
                />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label>Project Description</Label>
                <TextArea
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 최대 50자까지만 입력 가능
                    if (value.length <= 50) {
                      setDescription(value);
                    }
                  }}
                  maxLength={50}
                />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label>Start Date</Label>
                <StyledDatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
                  locale={enUS}
                  placeholderText="Select a date"
                  wrapperClassName="date-picker-wrapper"
                  className="date-picker-input"
                  calendarClassName="date-picker-calendar"
                />
              </div>

              <div>
                <Label>Images per Task (max 1000)</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  placeholder="Images per Task  ex) 1"
                  value={imagesPerTask}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Maximum value limit of 1000
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
                  Select Individual Files
                </TabButton>
                <TabButton
                  $active={uploadMethod === "zip"}
                  onClick={() => setUploadMethod("zip")}
                >
                  Upload ZIP File
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
                    ? "📁 Select or drag image files"
                    : "📦 Select or drag ZIP file"}
                </div>
                <UploadText>
                  {uploadMethod === "individual"
                    ? "You can select multiple image files at once"
                    : "Upload compressed image files"}
                </UploadText>
              </UploadArea>

              {uploadFiles.length > 0 && (
                <>
                  <FileList>
                    {uploadFiles.map((item, index) => (
                      <FileItem key={index}>
                        <FileInfo>
                          <FileName>
                            {item.originalFileName || item.file.name}
                          </FileName>
                          <ProgressBar>
                            <ProgressFill $progress={item.progress} />
                          </ProgressBar>
                          <FileStatus $status={item.status}>
                            {item.status === "pending" && "Pending"}
                            {item.status === "uploading" &&
                              `Uploading... ${item.progress}%`}
                            {item.status === "success" && "Completed"}
                            {item.status === "error" && "Failed"}
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
                      {isUploading ? "Uploading..." : "Start Upload"}
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
