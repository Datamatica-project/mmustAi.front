import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import UserInfo from "../molecules/UserInfo";
import ToolSelector from "../molecules/ToolSelector";
import ListSection from "../molecules/ListSection";
import ClassLabel from "../atoms/ClassLabel";
import DotMenuButton from "../molecules/DotMenuButton";
import {
  SaveIcon,
  SubmitIcon,
  LeftArrowIcon,
  RightArrowIcon,
  PolygonIcon,
  BBoxIcon,
} from "../icons/Icons";
import { objects } from "../../data";
import KonvaCanvas from "./KonvaCanvas";
import { getFileUrlByName } from "../../api/File";
import { deleteObject, getObjectsByLabelId, submitJob } from "../../api/Job";
import { useToastStore } from "../../store/toastStore";
import {
  useClassStore,
  uselabelDataFlagStore,
  useObjectStore,
} from "../../store/bboxStore";
import { getTaskImgList } from "../../api/Project";

const Section = styled.section`
  display: flex;
  justify-content: center;
  gap: 50px;
`;
const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #b6b5c5;
  line-height: 1.5;
  margin: 0;
  padding: 10px 0;

  max-width: 300px;
`;
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .file-info {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    h3 {
      font-size: 24px;
      font-weight: 700;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 300px;
    }
    p {
      font-size: 15px;
      font-weight: 800;
      color: #575871;
    }
  }
  .action-buttons {
    display: flex;
    gap: 10px;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 15px;
      font-weight: 700;
      font-family: inherit;
      color: #fff;
      padding: 5px 12px;
      border-radius: 10px;
      transition-duration: 150ms;
    }
    .save-btn {
      background-color: transparent;
      border: 2px solid #5b5d75;
      cursor: pointer;
      &:hover {
        background-color: #5b5d75;
      }
    }
    .submit-btn {
      background-color: #f62579;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: #e01f6b;
      }
    }
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

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const EditModalContent = styled.div`
  background-color: #3b3c5d;
  padding: 30px;
  border-radius: 10px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EditModalTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const EditModalInput = styled.input`
  padding: 10px;
  border: 2px solid #5b5d75;
  border-radius: 5px;
  background-color: #2a2b3d;
  color: #fff;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #f62579;
  }
`;

const EditModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const EditModalButton = styled.button`
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition-duration: 150ms;

  &.cancel {
    background-color: transparent;
    border: 2px solid #5b5d75;
    color: #fff;
    &:hover {
      background-color: #5b5d75;
    }
  }

  &.save {
    background-color: #f62579;
    border: none;
    color: #fff;
    &:hover {
      background-color: #e01f6b;
    }
  }
`;

export default function LabelingWorkspace({ fileId, fileName, jobData }) {
  const [selectButton, setSelectButton] = useState("Bounding Box");
  const { labelInfos } = useClassStore();
  const [selectedClass, setSelectedClass] = useState(0);
  const [imageRef, setImageRef] = useState(null);
  const [yoloLabels, setYoloLabels] = useState([]);
  // 클래스별로 저장된 오브젝트들: { [classId]: [{ id, name, yoloFormat, className }] }
  const [labeledObjects, setLabeledObjects] = useState({});
  // 클래스별 오브젝트 개수: { [classId]: number }
  const [classObjectCounts, setClassObjectCounts] = useState({});
  const [imageUrl, setImageUrl] = useState(null);
  // Konva 상에서 삭제할 바운딩 박스 id 목록
  const [deletedShapeIds, setDeletedShapeIds] = useState([]);
  const [objects, setObjects] = useState([]);

  const { projectId, taskId, jobId } = useParams();
  const [taskImgList, setTaskImgList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { labelDataFlag, setLabelDataFlag } = uselabelDataFlagStore();
  const { objectsStore, setObjectsStore } = useObjectStore();

  // 클릭 시 선택된 오브젝트 ID 상태 추가
  const [highlightedObjectId, setHighlightedObjectId] = useState(null);

  // 선택된 클래스에 대해서 오브젝트 목록 조회
  useEffect(() => {
    const fetchObjects = async () => {
      const response = await getObjectsByLabelId(jobId, selectedClass);
      setObjects(response.data);
    };
    fetchObjects();
  }, [selectedClass, labelDataFlag, jobId]);

  const handleClassClick = async (cls) => {
    setSelectedClass(cls.id);
  };

  useEffect(() => {
    const fetchTaskImgList = async () => {
      const listData = await getTaskImgList(taskId);
      setTaskImgList(listData.data?.items || []);

      const index =
        listData.data?.items?.findIndex((item) => item.id === +jobId) ?? -1;
      setCurrentIndex(index >= 0 ? index : 0);
    };
    fetchTaskImgList();
  }, [taskId, jobId]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevItem = taskImgList[currentIndex - 1];
      navigate(`/project/${projectId}/task/${taskId}/labeling/${prevItem.id}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < taskImgList.length - 1) {
      const nextItem = taskImgList[currentIndex + 1];
      navigate(`/project/${projectId}/task/${taskId}/labeling/${nextItem.id}`);
    }
  };

  // 바운딩 박스 완성 시 YOLO 형식으로 변환하여 저장
  const handleBoundingBoxComplete = (
    yoloFormat,
    className,
    objectName,
    shapeId
  ) => {
    // 클래스 ID 찾기
    const classItem = labelInfos.find((cls) => cls.name === className);
    const classId = classItem ? classItem.id : "0";

    // 새로운 오브젝트 생성
    const newObject = {
      // Konva shape id와 동일하게 사용
      id: shapeId || `obj_${Date.now()}_${Math.random()}`,
      name: objectName || `Object ${Date.now()}`,
      yoloFormat,
      className,
    };

    // 클래스별로 오브젝트 저장
    setLabeledObjects((prev) => {
      const updated = {
        ...prev,
        [classId]: [...(prev[classId] || []), newObject],
      };
      return updated;
    });

    // 클래스별 오브젝트 개수 업데이트
    setClassObjectCounts((prev) => ({
      ...prev,
      [classId]: (prev[classId] || 0) + 1,
    }));

    // YOLO 라벨도 저장
    setYoloLabels((prev) => {
      const updated = [...prev, yoloFormat];
      return updated;
    });
  };

  // 선택된 클래스의 오브젝트들 가져오기
  const getSelectedClassObjects = () => {
    if (!selectedClass) return [];
    return labeledObjects[selectedClass] || [];
  };

  // const labelingButtonsOptions = [
  //   { icon: BBoxIcon, title: "Bounding Box" },
  //   { icon: PolygonIcon, title: "Polygon" },
  // ];

  // 이름 수정 모달 상태
  const [editingObject, setEditingObject] = useState(null);
  const [editName, setEditName] = useState("");

  const handleEditClick = (objId) => {
    const obj = getSelectedClassObjects().find((o) => o.id === objId);
    if (obj) {
      setEditingObject(obj);
      setEditName(obj.name);
    }
  };

  const handleDeleteClick = async (objId) => {
    const response = await deleteObject(objId);

    if (response.resultCode === "SUCCESS") {
      setObjects(objects.filter((obj) => obj.id !== objId));
      setObjectsStore(objectsStore.filter((obj) => obj.id !== objId));
      setLabelDataFlag(!labelDataFlag);

      useToastStore
        .getState()
        .addToast("Object deleted successfully", "success");
    }
  };

  const handleSaveEdit = () => {
    if (!editingObject || !editName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    // labeledObjects에서 오브젝트 이름 업데이트
    setLabeledObjects((prev) => {
      const updated = { ...prev };
      if (updated[selectedClass]) {
        updated[selectedClass] = updated[selectedClass].map((obj) =>
          obj.id === editingObject.id ? { ...obj, name: editName.trim() } : obj
        );
      }
      return updated;
    });

    setEditingObject(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingObject(null);
    setEditName("");
  };

  // 이미지 URL 로드
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (jobData.fileName) {
        // fileName만 있으면 파일명으로 이미지 URL 생성

        const objectUrl = await getFileUrlByName(jobData.fileName);

        setImageUrl(objectUrl);
      } else {
        //없으면 기본 placeholder 이미지
        setImageUrl("https://picsum.photos/800/600");
      }
    };
    fetchImageUrl();
  }, [fileName, jobData]);

  const handleSubmit = async () => {
    const response = await submitJob(jobId);

    if (response.resultCode === "SUCCESS") {
      useToastStore
        .getState()
        .addToast("Job submitted successfully", "success");
    } else {
      useToastStore.getState().addToast("Failed to submit job", "error");
    }
  };

  return (
    <Section>
      {/* 왼쪽 사이드바 */}
      <Aside>
        {/* 작업자 정보 */}
        <UserInfo role="Labeler" userName="John Doe" />
        {/* 작업 도구 선택 */}
        {/* <ToolSelector
          buttons={labelingButtonsOptions}
          currentValue={selectButton}
          onChange={setSelectButton}
        /> */}
        <DescriptionText>
          You can label by drawing a bounding box through click and drag
        </DescriptionText>
        {/* 클래스 목록 */}
        <ListSection title={"Classes"}>
          {labelInfos
            .sort((a, b) => a.id - b.id)
            .map((cls) => {
              const objectCount = cls.objectInfos.length || 0;
              return (
                <ClassLabel
                  key={cls.id}
                  type="Class"
                  color={cls.hexColor}
                  name={cls.name}
                  isSelected={selectedClass === cls.id}
                  onClick={() => handleClassClick(cls)}
                >
                  <span className="objectCount">{objectCount}</span>
                </ClassLabel>
              );
            })}
        </ListSection>

        {/* 클래스별 각 객체 목록 */}
        <ListSection title={"Objects"}>
          {selectedClass ? (
            objects.length > 0 ? (
              objects.map((obj) => {
                const classItem = labelInfos.find(
                  (cls) => cls.id === selectedClass
                );
                return (
                  <ClassLabel
                    key={obj.id}
                    type="Object"
                    color={classItem?.hexColor || "red"}
                    name={obj.name}
                  >
                    <DotMenuButton
                      handleEditClick={() => handleEditClick(obj.id)}
                      handleDeleteClick={() => handleDeleteClick(obj.id)}
                      setHighlightedObjectId={setHighlightedObjectId}
                      objId={obj.id}
                    />
                  </ClassLabel>
                );
              })
            ) : (
              <DescriptionText style={{ padding: "10px" }}>
                No objects for this class yet
              </DescriptionText>
            )
          ) : (
            <DescriptionText style={{ padding: "10px" }}>
              Select a class to view objects
            </DescriptionText>
          )}
        </ListSection>
      </Aside>

      {/* 이미지 영역 */}
      <main>
        {/* 헤더 */}
        <Header>
          <div className="file-info">
            <h3>{fileName || "Image001.jpg"}</h3>
            <p>1 hour ago</p>
          </div>
          <div className="action-buttons">
            <button className="save-btn">
              {SaveIcon} <span>Save</span>
            </button>
            <button className="submit-btn" onClick={handleSubmit}>
              {SubmitIcon}Submit
            </button>
          </div>
        </Header>

        {/* 이미지 컨테이너 */}
        <ImageContainer className="image-container">
          {/* 캔버스 */}
          <KonvaCanvas
            selectButton={selectButton}
            classes={labelInfos}
            onBoundingBoxComplete={handleBoundingBoxComplete}
            imageRef={imageRef}
            deletedShapeIds={deletedShapeIds}
            jobData={jobData}
            highlightedObjectId={highlightedObjectId}
          />
          <img
            ref={setImageRef}
            src={imageUrl || "https://picsum.photos/800/600"}
            alt={fileName || "placeholder"}
            onLoad={(e) => {
              // 이미지 로드 완료 시 원본 크기 정보 전달
              if (e.target.naturalWidth && e.target.naturalHeight) {
                // KonvaCanvas에 이미지 크기 정보 전달 (추후 구현)
              }
            }}
            onError={(e) => {
              // 이미지 로드 실패 시 placeholder 이미지로 대체
              console.error("Failed to load image:", imageUrl);
              e.target.src = "https://picsum.photos/800/600";
            }}
          />
        </ImageContainer>

        {/* 하단 네비게이션 */}
        <footer>
          <Navigation>
            <button onClick={handlePrev} disabled={currentIndex === 0}>
              {LeftArrowIcon}Prev
            </button>
            <span>
              {String(currentIndex + 1).padStart(2, "0")}/
              {String(taskImgList.length).padStart(2, "0")}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === taskImgList.length - 1}
            >
              {RightArrowIcon}Next
            </button>
          </Navigation>
        </footer>
      </main>

      {/* 이름 수정 모달 */}
      {editingObject && (
        <EditModal onClick={handleCancelEdit}>
          <EditModalContent onClick={(e) => e.stopPropagation()}>
            <EditModalTitle>오브젝트 이름 수정</EditModalTitle>
            <EditModalInput
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSaveEdit();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
              autoFocus
              placeholder="오브젝트 이름을 입력하세요"
            />
            <EditModalButtons>
              <EditModalButton className="cancel" onClick={handleCancelEdit}>
                취소
              </EditModalButton>
              <EditModalButton className="save" onClick={handleSaveEdit}>
                저장
              </EditModalButton>
            </EditModalButtons>
          </EditModalContent>
        </EditModal>
      )}
    </Section>
  );
}
