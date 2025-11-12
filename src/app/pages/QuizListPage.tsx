import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, LoginModal, UnauthorizedPage, DateCard, Icon } from '@/components';
import { authUtils } from '@/lib/auth';

const QuizListPage = () => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAuthenticated = authUtils.isAuthenticated();

  // TODO: API 연결 시 사용
  const quizDates: string[] = [];

  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleDateClick = useCallback(
    (date: string) => {
      navigate(`/quiz-list/${date}`);
    },
    [navigate]
  );

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
      <Header logoUrl="/logo.svg" onLoginClick={handleOpenLoginModal} />

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
          {quizDates.length === 0 ? (
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
        {quizDates.length === 0 ? (
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

QuizListPage.displayName = 'QuizListPage';

export default QuizListPage;
