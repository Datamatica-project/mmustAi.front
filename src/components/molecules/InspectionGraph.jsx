import React, { useState, useEffect } from "react";
import styled from "styled-components";

const InspectionGraphContainer = styled.div`
  color: #b6b5c5;

  .graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  h4 {
    font-size: 12px;
    font-weight: 400;
  }
  span {
    font-weight: 700;
  }
  .graph {
    width: 100%;
    height: 5px;
    background-color: #26273d;
  }
`;

const GraphBar = styled.div.attrs((props) => ({
  style: {
    width: `${props.$percentage}%`,
    backgroundColor: props.color,
    borderRadius: "10px",
  },
}))`
  height: 100%;
  box-shadow: 0px 0px 10px 3px rgba(255, 255, 255, 0.25);
`;

export default function InspectionGraph({ labelled, value, tag }) {
  const Data = {
    Awaiting: {
      label: "awaiting review",
      color: "#f4c37e",
    },
    Completed: {
      label: "reviewed & approved",
      color: "#46EB83",
    },
    Rejected: {
      label: "reviewed rejected (rework needed)",
      color: "#F44468",
    },
  };

  const targetPercentage = Math.round((value / labelled) * 100);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1초 동안 애니메이션
    const startTime = Date.now();
    const startPercentage = animatedPercentage;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easing 함수 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const current =
        startPercentage + (targetPercentage - startPercentage) * easeOut;
      setAnimatedPercentage(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedPercentage(targetPercentage);
      }
    };

    requestAnimationFrame(animate);
  }, [targetPercentage]);

  return (
    <InspectionGraphContainer>
      <div className="graph-header">
        <h4>
          <span>{value}</span> {Data[tag].label}
        </h4>
        <span>{Math.round(animatedPercentage)}%</span>
      </div>
      <div className="graph">
        <GraphBar
          className="graph-bar"
          $percentage={animatedPercentage}
          color={Data[tag].color}
        />
      </div>
    </InspectionGraphContainer>
  );
}
