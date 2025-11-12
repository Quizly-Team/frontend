import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Footer, LoginModal, UnauthorizedPage, QuizCard } from '@/components';
import { authUtils } from '@/lib/auth';
import type { QuizHistoryDetail } from '@/types/quiz';

const QuizDetailPage = () => {
  const { date } = useParams<{ date: string }>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAuthenticated = authUtils.isAuthenticated();

  // TODO: API 연결 시 사용
  const quizzes: QuizHistoryDetail[] = [];

  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  // 비회원은 접근 불가
  if (!isAuthenticated) {
    return (
      <UnauthorizedPage
        variant="simple"
        isLoginModalOpen={isLoginModalOpen}
        onOpenLoginModal={handleOpenLoginModal}
        onCloseLoginModal={handleCloseLoginModal}
      />
    );
  }

  // 회원인 경우
  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header logoUrl="/logo.svg" onLoginClick={handleOpenLoginModal} />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-[60px] max-md:hidden">
        <div className="w-full max-w-[1024px]">
          {/* Title */}
          <h1 className="text-header1-bold text-gray-900 text-center mb-[60px]">
            {date}
          </h1>

          {/* Quiz Cards Grid */}
          {quizzes.length === 0 ? (
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
        {quizzes.length === 0 ? (
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

      {/* Footer - Web/Tablet Only */}
      <div className="max-md:hidden">
        <Footer />
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />

      {/* Home Indicator - Mobile Only */}
      <div className="hidden max-md:block fixed bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-[100px]" />
    </div>
  );
};

QuizDetailPage.displayName = 'QuizDetailPage';

export default QuizDetailPage;
