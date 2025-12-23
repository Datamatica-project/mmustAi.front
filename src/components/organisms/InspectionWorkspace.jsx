import React, { useEffect, useState } from "react";
import styled from "styled-components";
import UserInfo from "../molecules/UserInfo";
import InspectorButton from "../molecules/InspectorButton";
import ListSection from "../molecules/ListSection";
import ClassLabel from "../atoms/ClassLabel";
import { classes, objects } from "../../data";
import NoticeBTN from "../atoms/NoticeBTN";
import FeedBackModal from "../common/FeedBackModal";
import { LeftArrowIcon, RightArrowIcon } from "../icons/Icons";
import { useClassStore } from "../../store/bboxStore";
import { approveJob, getObjectsByLabelId, rejectJob } from "../../api/Job";
import { useToastStore } from "../../store/toastStore";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskImgList } from "../../api/Project";

const Section = styled.section`
  justify-content: center;
  display: flex;
  flex-direction: row;
  gap: 50px;
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

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function InspectionWorkspace({ imageUrl, jobData }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const { labelInfos } = useClassStore();
  const [objects, setObjects] = useState([]);
  const [feedback, setFeedback] = useState("");
  const { projectId, taskId, jobId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [taskImgList, setTaskImgList] = useState([]);

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
      navigate(`/project/${projectId}/task/${taskId}/reviewing/${prevItem.id}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < taskImgList.length - 1) {
      const nextItem = taskImgList[currentIndex + 1];
      navigate(`/project/${projectId}/task/${taskId}/reviewing/${nextItem.id}`);
    }
  };

  const handleClick = async (title) => {
    if (title === "Approve") {
      const response = await approveJob(jobData.id);

      if (response.resultCode === "SUCCESS") {
        useToastStore
          .getState()
          .addToast("Job approved successfully", "success");
      } else {
        useToastStore.getState().addToast("Failed to approve job", "error");
      }
      navigate(`/project/${projectId}/task/${taskId}`);
    } else if (title === "Reject") {
      setIsModalOpen(true);
    }
  };

  const handleNoticeClick = (id) => {
    setIsModalOpen(true);
    setSelectedButton(id);
  };

  const handleClassClick = async (cls) => {
    setSelectedClass(cls.id);
    const response = await getObjectsByLabelId(cls.id);
    setObjects(response.data);
  };

  const handleSubmit = async (feedback) => {
    const response = await rejectJob(jobData.id, feedback);

    if (response.resultCode === "SUCCESS") {
      useToastStore.getState().addToast("Job rejected successfully", "success");
      setIsModalOpen(false);
      setSelectedButton(null);
      setFeedback("");
    } else {
      useToastStore.getState().addToast("Failed to reject job", "error");
    }

    navigate(`/project/${projectId}/task/${taskId}`);
  };

  return (
    <Section>
      {/* 왼쪽 사이드바 */}
      <Aside>
        <UserInfo role="Inspector" userName="John Doe" />
        <InspectorButton handleClick={handleClick} />

        {/* 클래스 목록 */}
        <ListSection title={"Classes"}>
          {labelInfos
            .sort((a, b) => a.id - b.id)
            .map((cls) => {
              const objectCount = cls.count || 0;
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

        {/* 객체 목록 */}
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
                    {/* <NoticeBTN onClick={() => handleNoticeClick(obj.id)} /> */}
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
        {isModalOpen && (
          <FeedBackModal
            onClose={() => {
              setIsModalOpen(false);
              setSelectedButton(null);
              setFeedback("");
            }}
            onSubmit={() => {
              handleSubmit(feedback);
            }}
            feedback={feedback}
            handleFeedbackChange={(e) => {
              setFeedback(e.target.value);
            }}
          />
        )}
      </Aside>
      <main>
        {/* 헤더 */}
        <Header>
          <div className="file-info">
            <h3>Image001.jpg</h3>
            <p>Not reviewed</p>
          </div>
        </Header>
        <ImageContainer className="image-container">
          <img src={imageUrl} alt="placeholder" />
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
    </Section>
  );
}
