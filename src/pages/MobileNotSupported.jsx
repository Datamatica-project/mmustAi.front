import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1c1d2f 0%, #2a2b3d 100%);
  color: #ffffff;
  text-align: center;
`;

const IconContainer = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(234, 37, 127, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(234, 37, 127, 0.3);
`;

const Icon = styled.div`
  font-size: 64px;
  line-height: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Message = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #b6b5c5;
  margin-bottom: 8px;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Highlight = styled.span`
  color: #ea257f;
  font-weight: 600;
`;

const Button = styled.button`
  margin-top: 40px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background-color: #ea257f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d41e66;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(234, 37, 127, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 14px;
  }
`;

const InfoBox = styled.div`
  margin-top: 32px;
  padding: 24px;
  background-color: rgba(234, 37, 127, 0.05);
  border: 1px solid rgba(234, 37, 127, 0.2);
  border-radius: 12px;
  max-width: 500px;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const InfoItem = styled.li`
  font-size: 14px;
  color: #b6b5c5;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #ea257f;
    font-weight: bold;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default function MobileNotSupported() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    // 로그아웃 처리 (토큰 제거)
    localStorage.removeItem("email");
    // 로그인 페이지로 이동
    navigate("/login");
  };

  return (
    <Container>
      <IconContainer>
        <Icon>🖥️</Icon>
      </IconContainer>

      <Title>Desktop Access Required</Title>

      <Message>
        MMustAI is optimized for <Highlight>desktop browsers</Highlight> to
        provide the best labeling experience.
      </Message>

      <Message>
        Please access this service from a desktop or laptop computer for optimal
        performance.
      </Message>

      <Button onClick={handleGoToLogin}>Return to Login</Button>

      <InfoBox>
        <InfoTitle>Why desktop only?</InfoTitle>
        <InfoList>
          <InfoItem>
            Precise bounding box drawing requires mouse/trackpad precision
          </InfoItem>
          <InfoItem>
            Complex labeling tools work best on larger screens
          </InfoItem>
          <InfoItem>
            Better performance for handling large image datasets
          </InfoItem>
        </InfoList>
      </InfoBox>
    </Container>
  );
}
