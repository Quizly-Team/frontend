import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, UnauthorizedPage, QuizCard } from '@/components';
import { authUtils } from '@/lib/auth';
import { getQuizGroups } from '@/api/quiz';
import type { QuizHistoryDetail } from '@/types/quiz';

const QuizDetailPage = () => {
  const { date } = useParams<{ date: string }>();
  const [quizzes, setQuizzes] = useState<QuizHistoryDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authUtils.isAuthenticated();

  // 특정 날짜의 문제 목록 로드
  useEffect(() => {
    if (!isAuthenticated || !date) return;

    const fetchQuizzesByDate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getQuizGroups('date');

        if (response.success && response.quizGroupList) {
          // 해당 날짜의 문제 그룹 찾기
          const targetGroup = response.quizGroupList.find(
            (group) => group.group === date
          );

          if (targetGroup) {
            setQuizzes(targetGroup.quizHistoryDetailList);
          } else {
            setQuizzes([]);
          }
        } else {
          setError(response.errorCode || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzesByDate();
  }, [isAuthenticated, date]);

  // 비회원은 접근 불가
  if (!isAuthenticated) {
    return <UnauthorizedPage variant="simple" />;
  }

  // 회원인 경우
  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header logoUrl="/logo.svg" />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-[60px] max-md:hidden">
        <div className="w-full max-w-[1024px]">
          {/* Title */}
          <h1 className="text-header1-bold text-gray-900 text-center mb-[60px]">
            {date}
          </h1>

          {/* Quiz Cards Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body1-medium text-gray-600">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-body1-medium text-error mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white text-body3-regular px-l py-3 rounded-[6px] hover:bg-primary/90 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-body1-medium text-gray-600">
                해당 날짜에 풀어본 문제가 없습니다.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 max-md:flex-col">
              {/* Left Column */}
              <div className="flex-1 flex flex-col gap-4">
                {quizzes
                  .filter((_, index) => index % 2 === 0)
                  .map((quiz, index) => (
                    <QuizCard key={quiz.quizId} quiz={quiz} questionNumber={index * 2 + 1} />
                  ))}
              </div>
              {/* Right Column */}
              <div className="flex-1 flex flex-col gap-4">
                {quizzes
                  .filter((_, index) => index % 2 === 1)
                  .map((quiz, index) => (
                    <QuizCard key={quiz.quizId} quiz={quiz} questionNumber={index * 2 + 2} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col pt-[74px] pb-[100px] px-5">
        {/* Title */}
        <h1 className="text-header3-bold text-gray-900 text-center mb-12">
          {date}
        </h1>

        {/* Quiz Cards List (single column) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-body3-medium text-gray-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-body3-medium text-error mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white text-tint-regular px-l py-3 rounded-[6px] hover:bg-primary/90 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-body3-medium text-gray-600">
              해당 날짜에 풀어본 문제가 없습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {quizzes.map((quiz, index) => (
              <QuizCard key={quiz.quizId} quiz={quiz} questionNumber={index + 1} />
            ))}
          </div>
        )}
      </main>

      {/* Home Indicator - Mobile Only */}
      <div className="hidden max-md:block fixed bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-[100px]" />
    </div>
  );
};

QuizDetailPage.displayName = 'QuizDetailPage';

export default QuizDetailPage;
