import {
  PolygonIcon,
  BBoxIcon,
  ApproveIcon,
  RejectIcon,
} from "../components/icons/Icons";
// LabelingWorkspace에 사용되는 데이터
// 작업 도구 선택
export const inspectionOptions = [
  { id: "Approve", icon: ApproveIcon, label: "Approve" },
  { id: "Reject", icon: RejectIcon, label: "Reject" },
];
export const labelingOptions = [
  { id: "Polygon", icon: PolygonIcon, label: "Polygon" },
  { id: "Bounding Box", icon: BBoxIcon, label: "Bounding Box" },
];
// 클래스 목록
export const classes = [
  { id: "People", color: "red", name: "People", objectCount: 0 },
  { id: "Car", color: "blue", name: "Car", objectCount: 0 },
  { id: "Bike", color: "green", name: "Bike", objectCount: 0 },
  { id: "Bus", color: "yellow", name: "Bus", objectCount: 0 },
  { id: "Train", color: "purple", name: "Train", objectCount: 0 },
];

export const objects = [
  { id: "People", color: "red", name: "John Doe" },
  { id: "Car", color: "blue", name: "Car" },
  { id: "Bike", color: "green", name: "Bike" },
  { id: "Bus", color: "yellow", name: "Bus" },
  { id: "Train", color: "purple", name: "Train" },
];

export const data = {
  name: "Project_1",
  description: "This is a description of the project.",
  total: 1000,
  labelled: 700,
  watingReview: 150,
  completed: 500,
  rejected: 50,
  unlabelled: 300,
};
export const peopleCost = [
  { email: "john.doe@example.com", name: "John Doe", cost: 100 },
  { email: "jane.doe@example.com", name: "Jane Doe", cost: 200 },
  { email: "jim.beam@example.com", name: "Jim Beam", cost: 300 },
  { email: "jill.smith@example.com", name: "Jill Smith", cost: 400 },
  { email: "jack.brown@example.com", name: "Jack Brown", cost: 500 },
  { email: "jane.doe@example.com", name: "Jane Doe", cost: 200 },
  { email: "jim.beam@example.com", name: "Jim Beam", cost: 300 },
  { email: "jill.smith@example.com", name: "Jill Smith", cost: 400 },
];

export const TaskList = [
  { id: 1, name: "Task 1", current: 90, total: 100, status: "in-progress" },
  { id: 2, name: "Task 2", current: 80, total: 100, status: "complete" },
  { id: 3, name: "Task 3", current: 70, total: 100, status: "in-progress" },
  { id: 4, name: "Task 4", current: 60, total: 100, status: "complete" },
  { id: 5, name: "Task 5", current: 50, total: 100, status: "in-progress" },
  { id: 6, name: "Task 6", current: 40, total: 100, status: "in-progress" },
  { id: 7, name: "Task 7", current: 30, total: 100, status: "in-progress" },
  { id: 8, name: "Task 8", current: 20, total: 100, status: "in-progress" },
  { id: 9, name: "Task 9", current: 20, total: 100, status: "complete" },
  { id: 10, name: "Task 10", current: 20, total: 100, status: "complete" },
  { id: 11, name: "Task 11", current: 20, total: 100, status: "in-progress" },
];

export const ImageData = [
  {
    id: 1,
    fileName: "Image001.jpx",
    status: "in-progress",
  },
  {
    id: 2,
    fileName: "Image002.jpx",
    status: "complete",
  },
  {
    id: 3,
    fileName: "Image003.jpx",
    status: "in-progress",
  },
  {
    id: 4,
    fileName: "Image004.jpx",
    status: "rejected",
  },
  {
    id: 5,
    fileName: "Image005.jpx",
    status: "complete",
  },
  {
    id: 6,
    fileName: "Image006.jpx",
    status: "rejected",
  },
  {
    id: 7,
    fileName: "Image007.jpx",
    status: "in-progress",
  },
  {
    id: 8,
    fileName: "Image008.jpx",
    status: "rejected",
  },
  {
    id: 9,
    fileName: "Image009.jpx",
    status: "rejected",
  },
  {
    id: 10,
    fileName: "Image010.jpx",
    status: "complete",
  },
];
