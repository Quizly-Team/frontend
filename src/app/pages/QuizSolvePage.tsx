import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Icon, QuizResultModal } from '@/components';
import ProgressBar from '@/components/common/ProgressBar';
import type { QuizDetail, UserAnswer } from '@/types/quiz';
import { submitAnswerMember, submitAnswerRetry } from '@/api/quiz';
import { authUtils } from '@/lib/auth';

type QuizSolvePageProps = {
  quizDetailList: QuizDetail[];
  isRetryMode?: boolean;
  onComplete?: (answers: UserAnswer[]) => void;
  onExit?: () => void;
  onViewAll?: (answers: UserAnswer[]) => void;
};

const QuizSolvePage = ({
  quizDetailList,
  isRetryMode = false,
  onComplete,
  onExit,
  onViewAll,
}: QuizSolvePageProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<UserAnswer[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const solveTimeRef = useRef(0);

  const currentQuiz = quizDetailList[currentIndex];
  const isLastQuestion = currentIndex === quizDetailList.length - 1;
  const questionNumber = currentIndex + 1;
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    if (typeof performance === 'undefined') return;
    startTimeRef.current = performance.now();
    solveTimeRef.current = 0;
  }, [currentIndex]);


  const calculateSolveTime = useCallback(() => {
    if (typeof performance === 'undefined' || startTimeRef.current === null) {
      return 0;
    }
    const raw = (performance.now() - startTimeRef.current) / 1000;
    return Number(raw.toFixed(2));
  }, []);

  // 정답 여부 확인 (TRUE/FALSE를 O/X로 변환하여 비교)
  const normalizeAnswer = (answer: string) => {
    if (answer === 'TRUE') return 'O';
    if (answer === 'FALSE') return 'X';
    return answer;
  };

  const correctCount = useMemo(() => {
    if (!finalAnswers.length) return 0;

    return finalAnswers.reduce((count, answer) => {
      const quiz = quizDetailList.find(
        (quiz) => quiz.quizId === answer.quizId
      );

      if (!quiz) return count;

      return normalizeAnswer(answer.selectedAnswer) ===
        normalizeAnswer(quiz.answer)
        ? count + 1
        : count;
    }, 0);
  }, [finalAnswers, quizDetailList]);

  const isCorrect =
    normalizeAnswer(selectedAnswer) === normalizeAnswer(currentQuiz.answer);

  // const displayedElapsedSeconds = showResult
  //   ? solveTimeRef.current
  //   : Number((elapsedMs / 1000).toFixed(2));
  // const formattedElapsedSeconds = displayedElapsedSeconds.toFixed(2);

  const totalSolveTime = useMemo(
    () =>
      finalAnswers.reduce(
        (total, answer) => total + (answer.solveTime ?? 0),
        0
      ),
    [finalAnswers]
  );

  const handleSelectAnswer = useCallback(
    (answer: string) => {
      if (!showResult) {
        setSelectedAnswer(answer);
      }
    },
    [showResult]
  );

  const handleNextQuestion = useCallback(async () => {
    if (!selectedAnswer || isSubmitting) return;

    // 아직 채점 결과를 보여주지 않았다면 결과 표시
    if (!showResult) {
      const solveTimeSeconds = calculateSolveTime();
      solveTimeRef.current = solveTimeSeconds;

      // 회원인 경우 API 호출
      if (isAuthenticated) {
        setIsSubmitting(true);
        try {
          // 틀린 문제 재도전 모드면 retry API 사용, 아니면 기본 API 사용
          if (isRetryMode) {
            await submitAnswerRetry(
              currentQuiz.quizId,
              selectedAnswer,
              solveTimeSeconds
            );
          } else {
            await submitAnswerMember(
              currentQuiz.quizId,
              selectedAnswer,
              solveTimeSeconds
            );
          }
        } catch (error) {
          // 에러가 발생해도 UI 흐름은 유지 (사용자 경험 보호)
          if (import.meta.env.DEV) {
            console.error('답안 제출 실패:', error);
          }
        } finally {
          setIsSubmitting(false);
        }
      }

      setShowResult(true);
      return;
    }

    // 현재 답안 저장
    const newAnswer: UserAnswer = {
      quizId: currentQuiz.quizId,
      selectedAnswer,
      solveTime: solveTimeRef.current,
    };
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (isLastQuestion) {
      setFinalAnswers(updatedAnswers);
      setIsResultModalOpen(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer('');
    setShowResult(false);
  }, [
    selectedAnswer,
    currentQuiz,
    userAnswers,
    isLastQuestion,
    showResult,
    isAuthenticated,
    isSubmitting,
    calculateSolveTime,
  ]);

  const handleResultClose = useCallback(() => {
    if (!finalAnswers.length) return;
    setIsResultModalOpen(false);
    onComplete?.(finalAnswers);
  }, [finalAnswers, onComplete]);

  const handleViewAllClick = useCallback(() => {
    if (!finalAnswers.length) return;
    setIsResultModalOpen(false);
    if (onViewAll) {
      onViewAll(finalAnswers);
      return;
    }
    // 문제 모아보기 페이지로 이동
    navigate('/my-quizzes');
  }, [finalAnswers, onViewAll, navigate]);

  const handleCreateMore = useCallback(() => {
    setIsResultModalOpen(false);
    if (onExit) {
      onExit();
      return;
    }
    if (finalAnswers.length) {
      onComplete?.(finalAnswers);
    }
  }, [finalAnswers, onComplete, onExit]);

  if (!currentQuiz) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      {/* Header - Web/Tablet Only */}
      <div className="max-md:hidden">
        <Header logoUrl="/logo.svg" />
      </div>

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-6 max-md:hidden">
        <div className="w-full max-w-[1024px] max-lg:max-w-[904px]">
          {/* Title */}
          <div className="flex items-center gap-3 mb-[38px]">
            <h1 className="text-header1-bold text-gray-900 text-center">
              지금부터 본격 <span className="text-primary">문제 타임!</span>{' '}
              집중해서 풀어봐요
            </h1>
            <Icon name="write" size={40} className="text-gray-900" />
          </div>

          {/* Progress Bar */}
          <div className="mb-[60px]">
            <ProgressBar
              current={showResult ? questionNumber : questionNumber - 1}
              total={quizDetailList.length}
              isCompleted={isLastQuestion && showResult}
            />
          </div>

          {/* Quiz Container */}
          <div
            className={`bg-white border rounded-[16px] p-10 mb-[30px] ${
              showResult
                ? isCorrect
                  ? 'border-info'
                  : 'border-error'
                : 'border-gray-300'
            }`}
          >
            {/* Question */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <h2
                className={`text-body1-medium ${
                  showResult ? (isCorrect ? 'text-info' : 'text-error') : ''
                }`}
              >
                <span
                  className={
                    showResult
                      ? isCorrect
                        ? 'text-info'
                        : 'text-error'
                      : 'text-primary'
                  }
                >
                  Q{questionNumber}.{' '}
                </span>
                <span
                  className={
                    showResult
                      ? isCorrect
                        ? 'text-info'
                        : 'text-error'
                      : 'text-gray-900'
                  }
                >
                  {currentQuiz.text}
                </span>
              </h2>
              {/* <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                풀이 {formattedElapsedSeconds}초
              </span> */}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQuiz.type === 'TRUE_FALSE' ? (
                // OX 문제
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectAnswer('O')}
                    className={`
                      h-[120px] max-lg:h-[120px] rounded-[12px] border flex items-center justify-center transition-colors
                      ${
                        showResult
                          ? selectedAnswer === 'O'
                            ? normalizeAnswer(currentQuiz.answer) === 'O'
                              ? 'bg-white border-info'
                              : 'bg-white border-error'
                            : 'bg-white border-gray-300'
                          : selectedAnswer === 'O'
                          ? 'bg-primary/10 border-primary'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      name={
                        showResult && selectedAnswer === 'O'
                          ? normalizeAnswer(currentQuiz.answer) === 'O'
                            ? 'correct_blue'
                            : 'correct_red'
                          : 'correct_black'
                      }
                      size={40}
                    />
                  </button>
                  <button
                    onClick={() => handleSelectAnswer('X')}
                    className={`
                      h-[120px] max-lg:h-[120px] rounded-[12px] border flex items-center justify-center transition-colors
                      ${
                        showResult
                          ? selectedAnswer === 'X'
                            ? normalizeAnswer(currentQuiz.answer) === 'X'
                              ? 'bg-white border-info'
                              : 'bg-white border-error'
                            : 'bg-white border-gray-300'
                          : selectedAnswer === 'X'
                          ? 'bg-primary/10 border-primary'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      name={
                        showResult && selectedAnswer === 'X'
                          ? normalizeAnswer(currentQuiz.answer) === 'X'
                            ? 'error_blue'
                            : 'error_red'
                          : 'error_black'
                      }
                      size={40}
                    />
                  </button>
                </div>
              ) : (
                // 객관식 문제
                currentQuiz.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === currentQuiz.answer;

                  return (
                    <button
                      key={`${currentQuiz.quizId}-option-${index}`}
                      onClick={() => handleSelectAnswer(option)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-4 max-lg:h-[120px] max-lg:min-h-[120px] max-lg:py-0 rounded-[12px] border text-left transition-colors
                        ${
                          showResult
                            ? isSelected
                              ? isCorrectAnswer
                                ? 'bg-white border-info'
                                : 'bg-white border-error'
                              : 'bg-white border-gray-300'
                            : isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'bg-gray-50 border-gray-300'
                        }
                      `}
                    >
                      <Icon
                        name={
                          showResult && isSelected
                            ? isCorrectAnswer
                              ? 'check_blue'
                              : 'check_red'
                            : isSelected
                            ? 'check_black'
                            : 'check_black'
                        }
                        size={24}
                      />
                      <span className="text-body3-regular text-gray-900">
                        {option}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer || isSubmitting}
              className={`
                px-4 py-3 rounded-[6px] text-body3-regular text-white transition-colors
                ${
                  selectedAnswer && !isSubmitting
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting
                ? '제출 중...'
                : showResult
                ? isLastQuestion
                  ? '결과보기'
                  : '다음 문제'
                : '제출'}
            </button>
          </div>

          {/* 해설 영역 - 웹/태블릿 */}
          {showResult && (
            <div className="bg-white border border-gray-300 rounded-[16px] p-10 mt-8">
              <h3 className="text-body1-medium text-primary mb-6">해설 요약</h3>
              <div className="text-body2-medium text-gray-900">
                <p className="mb-0">{currentQuiz.explanation}</p>
                <p className="text-gray-600 mt-2">
                  정답 :{' '}
                  {currentQuiz.type === 'TRUE_FALSE'
                    ? currentQuiz.answer === 'TRUE'
                      ? 'O'
                      : currentQuiz.answer === 'FALSE'
                      ? 'X'
                      : currentQuiz.answer
                    : currentQuiz.answer}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col pt-[74px] pb-[140px]">
        <div className="w-full px-l">
          {/* Progress Bar */}
          <div className="mb-[47px]">
            <ProgressBar
              current={showResult ? questionNumber : questionNumber - 1}
              total={quizDetailList.length}
              isCompleted={isLastQuestion && showResult}
            />
          </div>

          {/* Quiz Container */}
          <div
            className={`bg-white border rounded-[16px] p-l mb-6 ${
              showResult
                ? isCorrect
                  ? 'border-info'
                  : 'border-error'
                : 'border-gray-300'
            }`}
          >
            {/* Question */}
            <div className="flex items-start justify-between gap-3 mb-l">
              <h2
                className={`text-body3-medium ${
                  showResult ? (isCorrect ? 'text-info' : 'text-error') : ''
                }`}
              >
                <span
                  className={
                    showResult
                      ? isCorrect
                        ? 'text-info'
                        : 'text-error'
                      : 'text-primary'
                  }
                >
                  Q{questionNumber}.{' '}
                </span>
                <span
                  className={
                    showResult
                      ? isCorrect
                        ? 'text-info'
                        : 'text-error'
                      : 'text-gray-900'
                  }
                >
                  {currentQuiz.text}
                </span>
              </h2>
              {/* <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                풀이 {formattedElapsedSeconds}초
              </span> */}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuiz.type === 'TRUE_FALSE' ? (
                // OX 문제
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelectAnswer('O')}
                    className={`
                      h-[60px] rounded-[8px] border flex items-center justify-center transition-colors
                      ${
                        showResult
                          ? selectedAnswer === 'O'
                            ? normalizeAnswer(currentQuiz.answer) === 'O'
                              ? 'bg-white border-info'
                              : 'bg-white border-error'
                            : 'bg-white border-gray-300'
                          : selectedAnswer === 'O'
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      name={
                        showResult && selectedAnswer === 'O'
                          ? normalizeAnswer(currentQuiz.answer) === 'O'
                            ? 'correct_blue'
                            : 'correct_red'
                          : 'correct_black'
                      }
                      size={24}
                    />
                  </button>
                  <button
                    onClick={() => handleSelectAnswer('X')}
                    className={`
                      h-[60px] rounded-[8px] border flex items-center justify-center transition-colors
                      ${
                        showResult
                          ? selectedAnswer === 'X'
                            ? normalizeAnswer(currentQuiz.answer) === 'X'
                              ? 'bg-white border-info'
                              : 'bg-white border-error'
                            : 'bg-white border-gray-300'
                          : selectedAnswer === 'X'
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      name={
                        showResult && selectedAnswer === 'X'
                          ? normalizeAnswer(currentQuiz.answer) === 'X'
                            ? 'error_blue'
                            : 'error_red'
                          : 'error_black'
                      }
                      size={24}
                    />
                  </button>
                </div>
              ) : (
                // 객관식 문제
                currentQuiz.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === currentQuiz.answer;

                  return (
                    <button
                      key={`${currentQuiz.quizId}-option-${index}`}
                      onClick={() => handleSelectAnswer(option)}
                      className={`
                        w-full flex items-center gap-2 px-3 py-3 rounded-[8px] border text-left transition-colors
                        ${
                          showResult
                            ? isSelected
                              ? isCorrectAnswer
                                ? 'bg-white border-info'
                                : 'bg-white border-error'
                              : 'bg-white border-gray-300'
                            : isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white hover:bg-gray-50 border-gray-300'
                        }
                      `}
                    >
                      <Icon
                        name={
                          showResult && isSelected
                            ? isCorrectAnswer
                              ? 'check_blue'
                              : 'check_red'
                            : isSelected
                            ? 'check_black'
                            : 'check_black'
                        }
                        size={16}
                      />
                      <span className="text-tint-regular text-gray-900">
                        {option}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 해설 영역 - 모바일 */}
          {showResult && (
            <div className="bg-white border border-gray-300 rounded-[16px] p-l">
              <h3 className="text-body3-medium text-primary mb-l">해설 요약</h3>
              <div className="text-body3-medium text-gray-900">
                <p className="mb-0">{currentQuiz.explanation}</p>
                <p className="text-gray-600 mt-2">
                  정답 :{' '}
                  {currentQuiz.type === 'TRUE_FALSE'
                    ? currentQuiz.answer === 'TRUE'
                      ? 'O'
                      : currentQuiz.answer === 'FALSE'
                      ? 'X'
                      : currentQuiz.answer
                    : currentQuiz.answer}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Buttons - Mobile Only */}
      <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white pt-4 pb-10 px-l z-50">
        <div className="flex gap-3">
          <button
            onClick={onExit}
            className="bg-white border border-gray-300 px-l py-[14px] rounded-[6px] text-body2-regular text-gray-600 whitespace-nowrap"
          >
            나가기
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer || isSubmitting}
            className={`
              flex-1 px-l py-[14px] rounded-[6px] text-body2-regular text-white transition-colors
              ${
                selectedAnswer && !isSubmitting
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting
              ? '제출 중...'
              : showResult
              ? (isLastQuestion ? '결과보기' : '다음 문제')
              : '제출'}
          </button>
        </div>
        
      </div>

      <QuizResultModal
        isOpen={isResultModalOpen}
        onClose={handleResultClose}
        correctCount={correctCount}
        totalCount={quizDetailList.length}
        onViewAll={handleViewAllClick}
        onCreateMore={handleCreateMore}
        totalSolveTime={totalSolveTime}
      />
    </div>
  );
};

QuizSolvePage.displayName = 'QuizSolvePage';

export default QuizSolvePage;
