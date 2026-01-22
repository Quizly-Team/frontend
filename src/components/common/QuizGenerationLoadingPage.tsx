import { useState, useEffect } from "react";
import LoadingStageCard from "./LoadingStageCard";

type LoadingStage = "analyzing" | "generating" | "complete";

type QuizGenerationLoadingPageProps = {
  isLoading: boolean;
  onComplete: () => void;
};

const QuizGenerationLoadingPage = ({
  isLoading,
  onComplete,
}: QuizGenerationLoadingPageProps) => {
  const [stage, setStage] = useState<LoadingStage>("analyzing");
  const [completedStages, setCompletedStages] = useState<Set<LoadingStage>>(
    new Set()
  );

  useEffect(() => {
    if (!isLoading) return;

    // Stage 1: 입력 텍스트 분석 (2초)
    const stage1Timer = setTimeout(() => {
      setCompletedStages((prev) => new Set(prev).add("analyzing"));
      setStage("generating");
    }, 2000);

    return () => {
      clearTimeout(stage1Timer);
    };
  }, [isLoading]);

  // API 응답 완료 시 (isLoading이 false가 될 때)
  useEffect(() => {
    if (!isLoading && stage === "generating") {
      setCompletedStages((prev) => new Set(prev).add("generating"));
      setStage("complete");
    }
  }, [isLoading, stage]);

  // Stage 3: 완료 처리
  useEffect(() => {
    if (stage === "complete") {
      // 1초 후 체크 표시하고 완료
      const completeTimer = setTimeout(() => {
        setCompletedStages((prev) => new Set(prev).add("complete"));

        // 체크 표시 후 바로 완료 콜백 호출
        onComplete();
      }, 1500);

      return () => {
        clearTimeout(completeTimer);
      };
    }
  }, [stage, onComplete]);

  // 컴포넌트가 언마운트될 때 상태 초기화
  useEffect(() => {
    return () => {
      setStage("analyzing");
      setCompletedStages(new Set());
    };
  }, []);

  // 로딩 중이거나 complete 단계일 때만 표시
  if (!isLoading && stage !== "complete" && !completedStages.has("complete")) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-[9px] bg-[rgba(248,249,250,0.8)] flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-12 w-full max-w-[1024px] max-lg:max-w-full max-md:max-w-[335px] px-6 max-lg:px-15 max-md:px-l">
        {/* 제목 및 설명 */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-header2-bold text-gray-900 whitespace-nowrap">
            AI가 문제를 만드는 중이에요...
          </h2>
          <div className="text-body3-regular text-gray-600 text-center leading-[1.4] whitespace-pre-wrap">
            잠시만 기다려주세요!{'\n'}이 작업은 최대 2분까지 소요될 수 있어요.
          </div>
        </div>

        {/* 로딩 스테이지 카드들 - Web/Tablet */}
        <div className="flex gap-l max-md:hidden justify-center w-full">
          <LoadingStageCard
            label="입력 텍스트 분석..."
            isCompleted={completedStages.has("analyzing")}
            isActive={stage === "analyzing"}
            responsive
          />
          <LoadingStageCard
            label="문제 생성 중..."
            isCompleted={completedStages.has("generating")}
            isActive={stage === "generating"}
            responsive
          />
          <LoadingStageCard
            label="문제 생성 완료!"
            isCompleted={completedStages.has("complete")}
            isActive={stage === "complete"}
            showExclamation
            responsive
          />
        </div>

        {/* 로딩 스테이지 카드들 - Mobile (세로 배열) */}
        <div className="hidden max-md:flex flex-col gap-3">
          <LoadingStageCard
            label="입력 텍스트 분석..."
            isCompleted={completedStages.has("analyzing")}
            isActive={stage === "analyzing"}
          />
          <LoadingStageCard
            label="문제 생성 중..."
            isCompleted={completedStages.has("generating")}
            isActive={stage === "generating"}
          />
          <LoadingStageCard
            label="문제 생성 완료!"
            isCompleted={completedStages.has("complete")}
            isActive={stage === "complete"}
            showExclamation
          />
        </div>
      </div>
    </div>
  );
};

QuizGenerationLoadingPage.displayName = "QuizGenerationLoadingPage";

export default QuizGenerationLoadingPage;
