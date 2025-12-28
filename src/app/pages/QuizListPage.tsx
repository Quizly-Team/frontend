import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, LoginModal, UnauthorizedPage, DateCard, Icon } from '@/components';
import { authUtils } from '@/lib/auth';
import { getQuizGroups } from '@/api/quiz';

const QuizListPage = () => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [quizDates, setQuizDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authUtils.isAuthenticated();

  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleDateClick = useCallback(
    (date: string) => {
      navigate(`/my-quizzes/${date}`);
    },
    [navigate]
  );

  // 문제 모아보기 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchQuizGroups = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getQuizGroups('date');

        if (response.success && response.quizGroupList) {
          // 날짜 목록 추출 및 정렬 (최신순)
          const dates = response.quizGroupList
            .map((group) => group.group)
            .sort((a, b) => b.localeCompare(a));
          setQuizDates(dates);
        } else {
          setError(response.errorCode || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('문제 모아보기 조회 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizGroups();
  }, [isAuthenticated]);

  // 비회원인 경우
  if (!isAuthenticated) {
    return (
      <UnauthorizedPage
        variant="full"
        isLoginModalOpen={isLoginModalOpen}
        onOpenLoginModal={handleOpenLoginModal}
        onCloseLoginModal={handleCloseLoginModal}
      />
    );
  }

  // 회원인 경우
  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header logoUrl="/logo.svg" />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-[60px] max-md:hidden">
        <div className="w-full max-w-[1024px]">
          {/* Title */}
          <div className="flex items-center gap-1 justify-center mb-[60px]">
            <h1 className="text-header1-bold text-gray-900 text-center">
              <span className="text-primary">복습</span>하고 싶은 문제 다 모아봤어요
            </h1>
            <Icon name="book" size={40} className="text-primary" />
          </div>

          {/* Quiz Date Cards Grid */}
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
          ) : quizDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-body1-medium text-gray-600">
                아직 풀어본 문제가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2">
              {quizDates.map((date) => (
                <DateCard
                  key={date}
                  date={date}
                  onClick={() => handleDateClick(date)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col pt-[74px] pb-[100px] px-5">
        {/* Title */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-1">
            <h1 className="text-header3-bold text-gray-900">
              <span className="text-primary">복습</span>하고 싶은 문제
            </h1>
            <Icon name="book" size={28} className="text-primary" />
          </div>
          <h1 className="text-header3-bold text-gray-900">
            다 모아봤어요
          </h1>
        </div>

        {/* Quiz Date Cards Grid */}
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
        ) : quizDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-body3-medium text-gray-600">
              아직 풀어본 문제가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {quizDates.map((date) => (
              <DateCard
                key={date}
                date={date}
                onClick={() => handleDateClick(date)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />

      {/* Home Indicator - Mobile Only */}
      <div className="hidden max-md:block fixed bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-[100px]" />
    </div>
  );
};

QuizListPage.displayName = 'QuizListPage';

export default QuizListPage;
