import React, { useEffect, useState } from "react";
import styled from "styled-components";

const DonutChartContainer = styled.div.attrs((props) => ({
  style: {
    background: `conic-gradient(
      from 0deg,
      #f62579 0%,
      #f62579 ${props.$percentage * 100}%,
      #282943 ${props.$percentage * 100}%,
      #282943 100%
    )`,
  },
}))`
  /* margin-bottom: 35px; */
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  .donut-chart-inner {
    background-color: #1c1d2f;
    border-radius: 50%;
    width: 85%;
    height: 85%;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 40px;
    font-weight: 400;
  }
`;

export default function DonutChart({ $percentage }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const targetPercentage = $percentage;
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
  }, [$percentage]);

  return (
    <DonutChartContainer $percentage={animatedPercentage}>
      <div className="donut-chart-inner">
        {Math.round(animatedPercentage * 100)}%
      </div>
    </DonutChartContainer>
  );
}
