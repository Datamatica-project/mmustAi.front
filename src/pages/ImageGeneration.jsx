import React, { useState, useRef, useEffect } from "react";
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

const RefreshButton = styled.button`
  background-color: transparent;
  color: #b6b5c5;
  border: 2px solid #5b5d75;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #5b5d75;
    color: #ffffff;
    border-color: #f62579;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const DownloadHint = styled.div`
  font-size: 14px;
  color: #b6b5c5;
  margin-top: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-style: italic;
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
  const [searchPage, setSearchPage] = useState(1); // Unsplash API 페이지 번호

  // 스크롤 및 포커스를 위한 ref
  const promptInputRef = useRef(null);
  const imagesSectionRef = useRef(null);

  // 이미지 검색 함수 (공통 로직)
  const fetchImages = async (page = 1, promptToUse = null) => {
    // 프롬프트 파라미터가 있으면 사용, 없으면 currentPrompt 또는 prompt 사용
    const searchPrompt = promptToUse || currentPrompt || prompt;

    if (!searchPrompt.trim()) {
      useToastStore.getState().addToast("Please enter a prompt", "error");
      return;
    }

    setIsGenerating(true);

    try {
      // Unsplash API를 사용하여 프롬프트로 이미지 검색
      // 환경 변수에서 Unsplash Access Key 가져오기 (없으면 기본값 사용)
      const unsplashAccessKey =
        import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_ACCESS_KEY"; // 실제 사용 시 환경 변수에 설정 필요

      // 프롬프트 사용
      const basePrompt = searchPrompt.trim();
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

      // 프롬프트를 검색어로 사용하여 Unsplash에서 이미지 검색 (페이지 번호 포함)
      const searchQuery = encodeURIComponent(enhancedPrompt);
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${unsplashAccessKey}&per_page=4&orientation=landscape&page=${page}`
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

        // 이미지 로드 후 스크롤을 맨 밑(input 위치)으로 이동하고 input에 포커스
        setTimeout(() => {
          // 페이지 맨 밑으로 스크롤 (input이 있는 위치)
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });

          // 스크롤 완료 후 input에 포커스
          setTimeout(() => {
            if (promptInputRef.current) {
              promptInputRef.current.focus();
            }
          }, 500);
        }, 100);
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      useToastStore.getState().addToast("Please enter a prompt", "error");
      return;
    }

    setCurrentPrompt(prompt);
    setSearchPage(1); // 새 검색 시 페이지를 1로 리셋
    // prompt를 직접 전달하여 즉시 사용 (currentPrompt 상태 업데이트를 기다리지 않음)
    await fetchImages(1, prompt);
  };

  // 다른 이미지 가져오기 (새로고침 버튼)
  const handleRefreshImages = async () => {
    if (!currentPrompt.trim()) {
      useToastStore
        .getState()
        .addToast("Please generate images first", "error");
      return;
    }

    // 다음 페이지로 이동 (최대 10페이지까지, 그 이후는 랜덤)
    const nextPage =
      searchPage >= 10 ? Math.floor(Math.random() * 10) + 1 : searchPage + 1;
    setSearchPage(nextPage);
    await fetchImages(nextPage);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  // 이미지 다운로드 함수
  const handleImageDownload = async (imageUrl, index) => {
    try {
      // 이미지 URL에서 파일명 추출 (없으면 기본값 사용)
      const urlParts = imageUrl.split("/");
      const filename =
        urlParts[urlParts.length - 1].split("?")[0] || `image-${index + 1}.jpg`;

      // 이미지를 fetch로 가져와서 blob으로 변환
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // blob URL 생성
      const blobUrl = window.URL.createObjectURL(blob);

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      useToastStore
        .getState()
        .addToast("Image downloaded successfully!", "success");
    } catch (error) {
      console.error("Image download error:", error);
      useToastStore.getState().addToast("Failed to download image", "error");
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
          <ImagesSection ref={imagesSectionRef}>
            <ImagesTitle>
              <TitleIndicator />
              Here are the images:
              <RefreshButton
                onClick={handleRefreshImages}
                disabled={isGenerating}
                style={{ marginLeft: "auto" }}
              >
                Load Different Images
              </RefreshButton>
            </ImagesTitle>
            <DownloadHint>Click on any image to download it</DownloadHint>
            <ImagesGrid>
              {generatedImages.map((imageUrl, index) => (
                <ImageCard
                  key={index}
                  onClick={() => handleImageDownload(imageUrl, index)}
                >
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
              ref={promptInputRef}
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
