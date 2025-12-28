import React, { useState } from "react";
import styled from "styled-components";
import { useToastStore } from "../store/toastStore";
import { ImageGenerationIcon } from "../components/icons/Project";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  color: #ffffff;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #b6b5c5;
  margin: 0;
  font-weight: 400;
`;

const ModelInfo = styled.div`
  text-align: right;
  margin-top: 8px;
`;

const ModelName = styled.div`
  font-size: 14px;
  color: #b6b5c5;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ModelDescription = styled.div`
  font-size: 12px;
  color: #8a8a9a;
  font-weight: 400;
`;

const PromptSection = styled.div`
  margin-bottom: 40px;
`;

const PromptInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  border: 2px solid #f62579;
  border-radius: 12px;
  padding: 4px 10px;
  background-color: #202236;
  box-shadow: 0 0 20px rgba(246, 37, 121, 0.3),
    0 0 40px rgba(246, 37, 121, 0.15);
  transition: box-shadow 0.3s ease;

  &:focus-within {
    box-shadow: 0 0 30px rgba(246, 37, 121, 0.5),
      0 0 60px rgba(246, 37, 121, 0.25);
  }
`;

const PromptInput = styled.textarea`
  flex: 1;
  background-color: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  padding: 16px 20px;
  resize: none;
  outline: none;
  font-family: inherit;
  min-height: 120px;
  line-height: 1.6;

  &::placeholder {
    color: #8a8a9a;
  }

  &:focus {
    outline: none;
  }
`;

const GenerateButton = styled.button`
  background-color: #f62579;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #d41e66;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    width: 20px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 2px;
  }
`;

const CurrentPromptSection = styled.div`
  margin-bottom: 30px;
  padding: 16px 20px;
  background-color: #202236;
  border-radius: 8px;
  border: 1px solid #3b3c5d;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PromptIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f62579;
  flex-shrink: 0;
`;

const CurrentPromptText = styled.div`
  font-size: 16px;
  color: #ffffff;
  flex: 1;
`;

const ImagesSection = styled.div`
  margin-top: 30px;
`;

const ImagesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 18px;
  color: #ffffff;
  font-weight: 600;
`;

const TitleIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #b6b5c5;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background-color: #202236;
  border: 1px solid #3b3c5d;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #f62579;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(246, 37, 121, 0.2);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2b3d 0%, #1a1b2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8a9a;
  font-size: 14px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #3b3c5d;
  border-top: 4px solid #f62579;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      useToastStore.getState().addToast("Please enter a prompt", "error");
      return;
    }

    setIsGenerating(true);
    setCurrentPrompt(prompt);

    try {
      // Unsplash API를 사용하여 프롬프트로 이미지 검색
      // 환경 변수에서 Unsplash Access Key 가져오기 (없으면 기본값 사용)
      const unsplashAccessKey =
        import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_ACCESS_KEY"; // 실제 사용 시 환경 변수에 설정 필요

      // 현장감 있는 사진을 얻기 위한 키워드 추가
      // 예쁜 배경사진 대신 실제 현장감 있는 사진을 검색하기 위해 키워드 조합
      const basePrompt = prompt.trim();
      const realisticKeywords = [
        "realistic",
        "documentary",
        "on-site",
        "field",
        "real world",
        "authentic",
        "natural",
        "unposed",
        "lifestyle",
        "editorial",
      ];

      // 프롬프트에 현장감 키워드가 포함되어 있지 않으면 자동으로 추가
      const hasRealisticKeyword = realisticKeywords.some((keyword) =>
        basePrompt.toLowerCase().includes(keyword)
      );

      // 검색어 구성: 원본 프롬프트 + 현장감 키워드 (없을 경우만 추가)
      const enhancedPrompt = hasRealisticKeyword
        ? basePrompt
        : `${basePrompt} realistic documentary on-site`;

      // 프롬프트를 검색어로 사용하여 Unsplash에서 이미지 검색
      const searchQuery = encodeURIComponent(enhancedPrompt);
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${unsplashAccessKey}&per_page=4&orientation=landscape`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();

      // 검색 결과에서 이미지 URL 추출
      if (data.results && data.results.length > 0) {
        const images = data.results.map((photo) => photo.urls.regular);
        setGeneratedImages(images);
        useToastStore
          .getState()
          .addToast("Images loaded successfully!", "success");
      } else {
        // 검색 결과가 없을 경우
        useToastStore
          .getState()
          .addToast("No images found for this prompt", "warning");
        setGeneratedImages([]);
      }
    } catch (error) {
      console.error("Image generation error:", error);

      // API 키가 없거나 에러 발생 시 더미 이미지 사용 (개발용)
      if (error.message?.includes("Unsplash API")) {
        useToastStore
          .getState()
          .addToast("Unsplash API error. Please check your API key.", "error");
      } else {
        useToastStore
          .getState()
          .addToast("Failed to load images. Please try again.", "error");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  return (
    <Container>
      <MainContent>
        <Header>
          <TitleSection>
            <Title>AI Image Generator</Title>
            <Subtitle>Type a prompt and let AI create for you.</Subtitle>
          </TitleSection>
          <ModelInfo>
            <ModelName>Model: MMustGen™</ModelName>
            <ModelDescription>
              Improved model for building data
            </ModelDescription>
          </ModelInfo>
        </Header>

        {currentPrompt && (
          <CurrentPromptSection>
            <PromptIndicator />
            <CurrentPromptText>{currentPrompt}</CurrentPromptText>
          </CurrentPromptSection>
        )}

        {generatedImages.length > 0 && (
          <ImagesSection>
            <ImagesTitle>
              <TitleIndicator />
              Here are the images:
            </ImagesTitle>
            <ImagesGrid>
              {generatedImages.map((imageUrl, index) => (
                <ImageCard key={index}>
                  {isGenerating && index === generatedImages.length - 1 ? (
                    <LoadingOverlay>
                      <Spinner />
                    </LoadingOverlay>
                  ) : null}
                  <Image src={imageUrl} alt={`Generated ${index + 1}`} />
                </ImageCard>
              ))}
            </ImagesGrid>
          </ImagesSection>
        )}

        <PromptSection>
          <PromptInputContainer>
            <PromptInput
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Describe the image you want to generate in detail`}
            />
            <GenerateButton onClick={handleGenerate} disabled={isGenerating}>
              {ImageGenerationIcon}
              Generate
            </GenerateButton>
          </PromptInputContainer>
        </PromptSection>
      </MainContent>
    </Container>
  );
}
