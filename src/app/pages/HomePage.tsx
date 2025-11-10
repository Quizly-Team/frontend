import { useState, useCallback, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Header, Footer, Icon, LoginModal, QuizCreateModal } from '@/components';
import { authUtils } from '@/lib/auth';

type QuizType = 'multiple' | 'ox';

const HomePage = () => {
  const [searchText, setSearchText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuizCreateModalOpen, setIsQuizCreateModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(authUtils.isAuthenticated());

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

  const handleSelectQuizType = useCallback((type: QuizType) => {
    // TODO: 선택한 퀴즈 타입으로 문제 생성 API 호출
    console.log('Selected quiz type:', type);
    console.log('Content:', searchText || file?.name);
  }, [searchText, file]);

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
            <button className="bg-white px-l py-4 rounded-[12px] shadow-sm hover:shadow-md transition-shadow flex items-center gap-1">
              <Icon name="book" size={28} />
              <span className="text-body1-medium text-gray-900">
                문제 모아보기
              </span>
            </button>

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
          <button className="bg-white px-3 py-[10px] rounded-[8px] shadow-sm flex items-center gap-1">
            <Icon name="book" size={24} />
            <span className="text-tint-regular text-gray-900">
              문제 모아보기
            </span>
          </button>

          <button className="bg-white px-3 py-[10px] rounded-[8px] shadow-sm flex items-center gap-1">
            <Icon name="write" size={24} />
            <span className="text-tint-regular text-gray-900">
              틀린문제 풀어보기
            </span>
          </button>
        </div>
      </main>

      {/* Fixed Bottom Input - Mobile Only */}
<<<<<<< Updated upstream
      <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white rounded-t-[30px] shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.06)] h-[140px] z-50">
        <div className="pt-6 px-5 flex items-center justify-between">
=======
      <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white rounded-t-[30px] shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.06)] pt-6 pb-10 px-l z-50">
        <div className="flex items-center justify-between gap-3">
>>>>>>> Stashed changes
          <input
            type="text"
            value={file ? file.name : searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={!!file}
            placeholder="정리한 내용을 입력하거나 파일을 업로드 해주세요."
            className="flex-1 text-body3-regular text-gray-900 placeholder:text-gray-600 outline-none bg-transparent disabled:text-gray-600 disabled:cursor-not-allowed"
          />

<<<<<<< Updated upstream
          {searchText || file ? (
            <button
              onClick={handleClearSearch}
              className="flex items-center justify-center ml-3 shrink-0"
              aria-label="입력 내용 지우기"
            >
              <Icon name="delete" size={24} className="text-gray-600" />
            </button>
          ) : (
            <label className="cursor-pointer flex items-center justify-center ml-3 shrink-0">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
              />
              <Icon name="upload" size={24} className="text-gray-600" />
            </label>
          )}
=======
          <div className="flex items-center gap-3">
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
>>>>>>> Stashed changes
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
    </div>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
