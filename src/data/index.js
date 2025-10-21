import { PolygonIcon, BBoxIcon } from "../components/icons/Icons";
// LabelingWorkspace에 사용되는 데이터
// 작업 도구 선택
export const options = [
  { id: "Polygon", icon: PolygonIcon, label: "Polygon" },
  { id: "Bounding Box", icon: BBoxIcon, label: "Bounding Box" },
];

// 클래스 목록
export const classes = [
  { id: "People", color: "red", name: "People", objectCount: 5 },
  { id: "Car", color: "blue", name: "Car", objectCount: 10 },
  { id: "Bike", color: "green", name: "Bike", objectCount: 15 },
  { id: "Bus", color: "yellow", name: "Bus", objectCount: 20 },
  { id: "Train", color: "purple", name: "Train", objectCount: 25 },
];
