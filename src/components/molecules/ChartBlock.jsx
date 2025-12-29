import React, { useState, useEffect } from "react";
import styled from "styled-components";

const ChartBlockContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  background-color: #282943;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  .value {
    font-size: 32px;
    font-weight: 400;
  }
  .label {
    font-size: 16px;
    font-weight: 400;
    color: #b6b5c5;
    text-align: center;
  }
`;

export default function ChartBlock({ value, label }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const targetValue = value;
    const duration = 1000; // 1초 동안 애니메이션
    const startTime = Date.now();
    const startValue = animatedValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easing 함수 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const current = startValue + (targetValue - startValue) * easeOut;
      setAnimatedValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <ChartBlockContainer>
      <span className="value">{Math.round(animatedValue)}</span>
      <span className="label">{label}</span>
    </ChartBlockContainer>
  );
}
