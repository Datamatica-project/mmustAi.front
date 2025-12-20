import React, { useState, useEffect } from "react";
import styled from "styled-components";

const WorkloadContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 10px;
  flex-direction: column;
  background-color: #282943;
  border-radius: 10px;

  padding: 25px;
  color: #b6b5c5;
  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }
  p {
    font-size: 12px;
    font-weight: 400;
  }
  span {
    font-weight: 700;
  }
  .workload__total {
    font-size: 48px;
    font-weight: 700;
    color: #ffffff;
  }
  p.workload__total {
    font-size: 15px;
    color: #b6b5c5;
    font-weight: 400;
  }
  .workload__list {
    margin-top: 10px;
    font-size: 16px;
    font-weight: 400;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;
export default function Workload({ value }) {
  const targetUnlabelled = value?.inProgressJobCount || 0;
  const targetRejected = value?.rejectedJobCount || 0;
  const targetTotal = targetUnlabelled + targetRejected;

  const [animatedUnlabelled, setAnimatedUnlabelled] = useState(0);
  const [animatedRejected, setAnimatedRejected] = useState(0);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1초 동안 애니메이션
    const startTime = Date.now();
    const startUnlabelled = animatedUnlabelled;
    const startRejected = animatedRejected;
    const startTotal = animatedTotal;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easing 함수 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentUnlabelled =
        startUnlabelled + (targetUnlabelled - startUnlabelled) * easeOut;
      const currentRejected =
        startRejected + (targetRejected - startRejected) * easeOut;
      const currentTotal = startTotal + (targetTotal - startTotal) * easeOut;

      setAnimatedUnlabelled(currentUnlabelled);
      setAnimatedRejected(currentRejected);
      setAnimatedTotal(currentTotal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedUnlabelled(targetUnlabelled);
        setAnimatedRejected(targetRejected);
        setAnimatedTotal(targetTotal);
      }
    };

    requestAnimationFrame(animate);
  }, [targetUnlabelled, targetRejected, targetTotal]);

  return (
    <WorkloadContainer>
      <h3>Workload Summary</h3>
      <p>
        <span>{targetTotal}</span> images needing action
      </p>
      <p className="workload__total">
        <span className="workload__total">{Math.round(animatedTotal)}</span>{" "}
        images
      </p>
      <ul className="workload__list">
        <li>
          <span>{targetUnlabelled}</span> unlabelled
        </li>
        <li>
          <span>{targetRejected}</span> rework required
        </li>
      </ul>
    </WorkloadContainer>
  );
}
