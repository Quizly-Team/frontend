import { useState, useCallback, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Header, Footer, Icon, LoginModal, QuizCreateModal } from '@/components';
import { authUtils } from '@/lib/auth';
import { useCreateQuiz } from '@/hooks/useCreateQuiz';
import QuizSolvePage from './QuizSolvePage';
import type { QuizDetail, UserAnswer } from '@/types/quiz';

type QuizType = 'multiple' | 'ox';

const HomePage = () => {
  const [searchText, setSearchText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuizCreateModalOpen, setIsQuizCreateModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(authUtils.isAuthenticated());
  const [quizData, setQuizData] = useState<QuizDetail[] | null>(null);

  const { mutate: createQuiz, isPending } = useCreateQuiz();

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setSearchText('');
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setFile(null);
  }, []);

  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleOpenQuizCreateModal = useCallback(() => {
    if (!searchText && !file) return; // 입력이 없으면 모달 열지 않음
    setIsQuizCreateModalOpen(true);
  }, [searchText, file]);

  const handleCloseQuizCreateModal = useCallback(() => {
    setIsQuizCreateModalOpen(false);
  }, []);

  const handleSelectQuizType = useCallback(
    (type: QuizType) => {
      const content = file || searchText;
      if (!content) return;

      // QuizType 매핑 (multiple -> MULTIPLE_CHOICE, ox -> TRUE_FALSE)
      const apiType = type === 'multiple' ? 'MULTIPLE_CHOICE' : 'TRUE_FALSE';

      console.log('[HomePage] 문제 생성 시작:', {
        type: apiType,
        isLoggedIn,
        contentType: content instanceof File ? 'file' : 'text',
        hasToken: !!authUtils.getAccessToken(),
      });

      createQuiz(
        {
          content,
          type: apiType,
          isLoggedIn,
        },
        {
          onSuccess: (response) => {
            console.log('문제 생성 성공:', response);
            if (response.success && response.quizDetailList.length > 0) {
              setQuizData(response.quizDetailList);
              setIsQuizCreateModalOpen(false);
              setSearchText('');
              setFile(null);
            } else {
              alert('문제 생성에 실패했습니다. 다시 시도해주세요.');
            }
          },
          onError: (error) => {
            console.error('문제 생성 오류:', error);
            alert(
              error.message || '문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
            );
          },
        }
      );
    },
    [searchText, file, isLoggedIn, createQuiz]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (searchText || file)) {
      handleOpenQuizCreateModal();
    }
  }, [searchText, file, handleOpenQuizCreateModal]);

  // 로그인 상태 체크 (컴포넌트 마운트 시 및 storage 이벤트 감지)
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(authUtils.isAuthenticated());
    };

    // 초기 체크
    checkAuthStatus();

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    window.addEventListener('storage', checkAuthStatus);

    // 주기적 체크 (같은 탭에서의 변경 감지)
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      clearInterval(interval);
    };
  }, []);

  const handleQuizComplete = useCallback((answers: UserAnswer[]) => {
    console.log('퀴즈 완료! 답변:', answers);
    // TODO: 채점 API 호출
    setQuizData(null); // 홈으로 돌아가기
  }, []);

  const handleQuizExit = useCallback(() => {
    setQuizData(null); // 홈으로 돌아가기
  }, []);

  // 문제 풀이 페이지 표시
  if (quizData) {
    return (
      <QuizSolvePage
        quizDetailList={quizData}
        onComplete={handleQuizComplete}
        onExit={handleQuizExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      {/* Header */}
      <Header logoUrl="/logo.svg" onLoginClick={handleOpenLoginModal} />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex justify-center py-8 max-md:hidden">
        <div className="max-w-[1024px] w-full px-xl max-lg:px-15 flex flex-col items-center justify-center">
          {/* Character Images */}
          <div className="flex gap-[15px] mb-10 ">
            <img
              src="/characters/character1.png"
              alt="캐릭터 1"
              className="w-[72px] h-[72px]"
            />
            <img
              src="/characters/character2.png"
              alt="캐릭터 2"
              className="w-[79px] h-[72px]"
            />
            <img
              src="/characters/character3.png"
              alt="캐릭터 3"
              className="w-[72px] h-[72px]"
            />
            <img
              src="/characters/character4.png"
              alt="캐릭터 4"
              className="w-[72px] h-[72px]"
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex gap-[15px] mb-10 relative z-10"></div>
            <div className="w-[300px] h-[10px] bg-gray-400 rounded-full blur-sm opacity-50 -mt-10 z-0 absolute"></div>
          </div>

          {/* Title */}
          <h1 className="text-header1-bold text-gray-900 text-center mb-12">
            <span className="text-primary">퀴즐리</span>로 문제 생성부터 오답
            정리까지 한 번에!
          </h1>

          {/* Search Bar - Web/Tablet */}
          <div className="w-full mb-8">
            <div
              className="bg-white border border-gray-300 rounded-[100px] px-8 py-l shadow-sm"
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <div className="flex items-center gap-3">
                <Icon name="search" size={32} className="text-gray-600" />

                <input
                  type="text"
                  value={file ? file.name : searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="정리한 내용을 입력하거나 파일을 업로드 해주세요."
                  disabled={!!file}
                  className="flex-1 text-body2-regular text-gray-900 placeholder:text-gray-600 outline-none bg-transparent disabled:text-gray-600 disabled:cursor-not-allowed"
                />

                {searchText || file ? (
                  <button
                    onClick={handleClearSearch}
                    className="flex items-center justify-center"
                    aria-label="입력 내용 지우기"
                  >
                    <Icon name="delete" size={32} className="text-gray-600" />
                  </button>
                ) : (
                  <label className="cursor-pointer flex items-center justify-center">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.pdf,.doc,.docx"
                    />
                    <Icon name="upload" size={32} className="text-gray-600" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Web/Tablet */}
          <div className="flex gap-4">
            <a
              href="/my-quizzes"
              className="bg-white px-l py-4 rounded-[12px] shadow-sm hover:shadow-md transition-shadow flex items-center gap-1"
            >
              <Icon name="book" size={28} />
              <span className="text-body1-medium text-gray-900">
                문제 모아보기
              </span>
            </a>

            <button className="bg-white px-l py-4 rounded-[12px] shadow-sm hover:shadow-md transition-shadow flex items-center gap-1">
              <Icon name="write" size={28} />
              <span className="text-body1-medium text-gray-900">
                틀린문제 풀어보기
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col items-center pt-41 pb-[180px] px-margin-mobile">
        {/* Character Images - Mobile */}
        <div className="flex flex-col items-center mb-6 relative">
          <div className="flex gap-[7px] relative z-10">
            <img
              src="/characters/character1.png"
              alt="캐릭터 1"
              className="w-[60px] h-[60px]"
            />
            <img
              src="/characters/character2.png"
              alt="캐릭터 2"
              className="w-[66px] h-[60px]"
            />
            <img
              src="/characters/character3.png"
              alt="캐릭터 3"
              className="w-[60px] h-[60px]"
            />
            <img
              src="/characters/character4.png"
              alt="캐릭터 4"
              className="w-[60px] h-[60px]"
            />
          </div>
          <div className="absolute top-[50px] w-[280px] h-[10px] bg-gray-400 rounded-full blur-sm opacity-75 z-0"></div>
        </div>

        {/* Title - Mobile (2줄) */}
        <h1 className="text-header3-bold text-gray-900 text-center mb-10">
          <span className="text-primary">퀴즐리</span>로 문제 생성부터
          <br />
          오답 정리까지 한 번에!
        </h1>

        {/* Action Buttons - Mobile */}
        <div className="flex gap-3">
          <a
            href="/my-quizzes"
            className="bg-white px-3 py-[10px] rounded-[8px] shadow-sm flex items-center gap-1"
          >
            <Icon name="book" size={24} />
            <span className="text-tint-regular text-gray-900">
              문제 모아보기
            </span>
          </a>

          <button className="bg-white px-3 py-[10px] rounded-[8px] shadow-sm flex items-center gap-1">
            <Icon name="write" size={24} />
            <span className="text-tint-regular text-gray-900">
              틀린문제 풀어보기
            </span>
          </button>
        </div>
      </main>

      {/* Fixed Bottom Input - Mobile Only */}
      <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white rounded-t-[30px] shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.06)] h-[140px] z-50">
        <div className="pt-6 px-5 flex items-center justify-between gap-3">
          <input
            type="text"
            value={file ? file.name : searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={!!file}
            placeholder="정리한 내용을 입력하거나 파일을 업로드 해주세요."
            className="flex-1 text-body3-regular text-gray-900 placeholder:text-gray-600 outline-none bg-transparent disabled:text-gray-600 disabled:cursor-not-allowed"
          />

          <div className="flex items-center gap-3 shrink-0">
            {searchText || file ? (
              <>
                <button
                  onClick={handleClearSearch}
                  className="flex items-center justify-center"
                  aria-label="입력 내용 지우기"
                >
                  <Icon name="delete" size={24} className="text-gray-600" />
                </button>
                <button
                  onClick={handleOpenQuizCreateModal}
                  className="bg-primary text-white text-tint-regular px-4 py-2 rounded-[6px] hover:bg-primary/90 transition-colors whitespace-nowrap"
                  aria-label="보내기"
                >
                  보내기
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex items-center justify-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                />
                <Icon name="upload" size={24} className="text-gray-600" />
              </label>
            )}
          </div>
        </div>

      </div>

      {/* Footer - Web/Tablet Only */}
      <div className="max-md:hidden">
        <Footer />
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
      />

      {/* Quiz Create Modal */}
      <QuizCreateModal
        isOpen={isQuizCreateModalOpen}
        onClose={handleCloseQuizCreateModal}
        onSelectQuizType={handleSelectQuizType}
        isLoggedIn={isLoggedIn}
      />

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-[24px] p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-body3-medium text-gray-900">문제 생성 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
