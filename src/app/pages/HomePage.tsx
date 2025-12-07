import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import {
  Header,
  Footer,
  Icon,
  LoginModal,
  QuizCreateModal,
  QuizGenerationLoadingPage,
  Tooltip,
  MockExamSettingModal,
} from '@/components';
import { authUtils } from '@/lib/auth';
import { validatePdfPageCount, validateFileType } from '@/lib/pdfUtils';
import { useCreateQuiz } from '@/hooks/useCreateQuiz';
import { useCreateMockExam, useCreateMockExamByFile } from '@/hooks/useMockExam';
import { useNavigate } from 'react-router-dom';
import QuizSolvePage from './QuizSolvePage';
import type { QuizDetail, UserAnswer } from '@/types/quiz';
import type { MockExamSettingData } from '@/components/modal/MockExamSettingModal';

type QuizType = 'multiple' | 'ox';

const HomePage = () => {
  const [searchText, setSearchText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuizCreateModalOpen, setIsQuizCreateModalOpen] = useState(false);
  const [isMockExamModalOpen, setIsMockExamModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(authUtils.isAuthenticated());
  const [quizData, setQuizData] = useState<QuizDetail[] | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [showPdfTooltip, setShowPdfTooltip] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const webTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mobileTextareaRef = useRef<HTMLTextAreaElement>(null);

  const navigate = useNavigate();

  const heroTexts = [
    '(퀴즐리)로 문제 생성부터 오답정리까지 한 번에!',
    '자격증 대비 (요점 정리)를 검색창에 입력해보세요.',
    '오늘 배운 과목의 (필기 내용)을 입력해보세요.',
    '전공 (시험 대비)를 위한 범위를 입력해보세요.'
  ];

  const heroTextsMobile = [
    '(퀴즐리)로 문제 생성부터\n오답정리까지 한 번에!',
    '자격증 대비 (요점 정리)를\n검색창에 입력해보세요.',
    '오늘 배운 과목의 (필기 내용)을\n입력해보세요.',
    '전공 (시험 대비)를 위한\n범위를 입력해보세요.'
  ];
  const { mutate: createQuiz, isPending } = useCreateQuiz();
  const { mutate: createMockExam, isPending: isMockExamPending } = useCreateMockExam();
  const { mutate: createMockExamByFile, isPending: isMockExamFilePending } = useCreateMockExamByFile();

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // 지원하는 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const typeValidation = validateFileType(uploadedFile, allowedTypes);

    if (!typeValidation.isValid) {
      alert(typeValidation.error);
      e.target.value = '';
      return;
    }

    // PDF 파일인 경우 페이지 수 체크
    if (uploadedFile.type === 'application/pdf') {
      const pdfValidation = await validatePdfPageCount(uploadedFile, 10);

      if (!pdfValidation.isValid) {
        alert(pdfValidation.error);
        e.target.value = '';
        return;
      }

      console.log('PDF 페이지 수:', pdfValidation.pageCount);
    }

    // JPG/PNG 파일인 경우 안내 메시지 (이미 한 장만 선택 가능)
    if (uploadedFile.type.startsWith('image/')) {
      console.log('이미지 파일 업로드:', uploadedFile.name);
    }

    setFile(uploadedFile);
    setSearchText('');
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

      setIsLoadingComplete(false);

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
              setIsLoadingComplete(true);
            }
          },
          onError: (error) => {
            console.error('문제 생성 오류:', error);
            alert(
              error.message || '문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
            );
            setIsLoadingComplete(true);
          },
        }
      );
    },
    [searchText, file, isLoggedIn, createQuiz]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && (searchText || file)) {
      e.preventDefault();
      handleOpenQuizCreateModal();
    }
  }, [searchText, file, handleOpenQuizCreateModal]);

  // Textarea 자동 높이 조절 (웹/태블릿: 최대 2줄)
  const adjustWebTextareaHeight = useCallback(() => {
    const textarea = webTextareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate
    textarea.style.height = 'auto';

    const lineHeight = 28; // body2-regular의 line-height (20px * 1.4)
    const maxHeight = lineHeight * 2; // 2줄 최대
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  // Textarea 자동 높이 조절 (모바일: 최대 6줄)
  const adjustMobileTextareaHeight = useCallback(() => {
    const textarea = mobileTextareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate
    textarea.style.height = 'auto';

    const lineHeight = 22.4; // body3-regular의 line-height (16px * 1.4)
    const maxHeight = lineHeight * 6; // 6줄 최대
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  // searchText 변경 시 textarea 높이 조절
  useEffect(() => {
    adjustWebTextareaHeight();
    adjustMobileTextareaHeight();
  }, [searchText, adjustWebTextareaHeight, adjustMobileTextareaHeight]);

  // 텍스트 무한 슬라이드 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentTextIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 인덱스가 마지막에 도달하면 첫 번째로 리셋
  useEffect(() => {
    if (currentTextIndex === heroTexts.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentTextIndex(0);
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [currentTextIndex, heroTexts.length]);

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
    setIsLoadingComplete(false);
  }, []);

  const handleQuizExit = useCallback(() => {
    setQuizData(null); // 홈으로 돌아가기
    setIsLoadingComplete(false);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingComplete(true);
  }, []);

  const handleOpenMockExamModal = useCallback(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      handleOpenLoginModal();
      return;
    }
    setIsMockExamModalOpen(true);
  }, [isLoggedIn]);

  const handleCloseMockExamModal = useCallback(() => {
    setIsMockExamModalOpen(false);
  }, []);

  const handleMockExamSubmit = useCallback(
    (data: MockExamSettingData) => {
      const onSuccess = (response: any) => {
        console.log('모의고사 생성 성공:', response);
        setIsMockExamModalOpen(false);
        navigate('/mock-exam', {
          state: {
            mockExamDetailList: response.mockExamDetailList,
          },
        });
      };

      const onError = (error: Error) => {
        console.error('모의고사 생성 오류:', error);
        alert(
          error.message || '모의고사 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
        );
      };

      // 파일이 있는 경우 OCR API 호출
      if (data.file) {
        createMockExamByFile(
          {
            file: data.file,
            mockExamTypeList: data.mockExamTypeList,
          },
          { onSuccess, onError }
        );
      } else if (data.plainText) {
        // 텍스트만 있는 경우 기존 API 호출
        createMockExam(
          {
            plainText: data.plainText,
            mockExamTypeList: data.mockExamTypeList,
          },
          { onSuccess, onError }
        );
      }
    },
    [createMockExam, createMockExamByFile, navigate]
  );

  // 문제 풀이 페이지 표시 (로딩 완료 후에만)
  if (quizData && isLoadingComplete) {
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
      <Header
        logoUrl="/logo.svg"
        onLoginClick={handleOpenLoginModal}
        onMockExamClick={handleOpenMockExamModal}
      />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex justify-center py-8 max-md:hidden">
        <div className="max-w-[1024px] w-full px-xl max-lg:px-15 flex flex-col items-center justify-center">
          {/* Character Images */}
          <div className="flex flex-col items-center mb-2 relative">
            <div className="flex gap-[15px] relative z-10">
              <img
                src="/characters/character1.png"
                alt="캐릭터 1"
                className="w-[72px] h-[72px] animate-[bounce_2s_ease-in-out_infinite]"
              />
              <img
                src="/characters/character2.png"
                alt="캐릭터 2"
                className="w-[79px] h-[72px] animate-[bounce_2s_ease-in-out_0.2s_infinite]"
              />
              <img
                src="/characters/character3.png"
                alt="캐릭터 3"
                className="w-[72px] h-[72px] animate-[bounce_2s_ease-in-out_0.4s_infinite]"
              />
              <img
                src="/characters/character4.png"
                alt="캐릭터 4"
                className="w-[72px] h-[72px] animate-[bounce_2s_ease-in-out_0.6s_infinite]"
              />
            </div>
            <div className="w-[300px] h-[10px] bg-gray-400 rounded-full blur-sm opacity-50 mt-2 z-0"></div>
          </div>

          {/* Title - 무한 슬라이드 애니메이션 */}
          <div className="h-[84px] mb-8 overflow-hidden relative">
            <div
              className={isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}
              style={{ transform: `translateY(-${currentTextIndex * 84}px)` }}
            >
              {[...heroTexts, heroTexts[0]].map((text, index) => (
                <h1
                  key={index}
                  className="text-header1-bold text-gray-900 text-center h-[84px] flex items-center justify-center whitespace-pre-wrap"
                  style={{ lineHeight: '1.4' }}
                >
                  {text.split(/(\([^)]+\))/).map((part, partIndex) => {
                    if (!part) return null;
                    if (part.match(/^\([^)]+\)$/)) {
                      return (
                        <span key={partIndex} className="text-primary">
                          {part.slice(1, -1)}
                        </span>
                      );
                    }
                    return part;
                  })}
                </h1>
              ))}
            </div>
          </div>

          {/* Search Bar - Web/Tablet */}
          <div className="w-full mb-8">
            <div
              className="bg-white border border-gray-300 rounded-[100px] px-8 py-l shadow-sm"
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <div className="flex items-center gap-3">
                <Icon name="search" size={32} className="text-gray-600" />

                <textarea
                  ref={webTextareaRef}
                  value={file ? file.name : searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="정리한 내용을 입력하거나 파일을 업로드 해주세요."
                  disabled={!!file}
                  rows={1}
                  className="flex-1 text-body2-regular text-gray-900 placeholder:text-gray-600 outline-none bg-transparent disabled:text-gray-600 disabled:cursor-not-allowed resize-none overflow-hidden"
                />

                {searchText || file ? (
                  <button
                    onClick={handleClearSearch}
                    className="flex items-center justify-center shrink-0"
                    aria-label="입력 내용 지우기"
                  >
                    <Icon name="delete" size={32} className="text-gray-600" />
                  </button>
                ) : (
                  <div className="relative">
                    <label
                      className="cursor-pointer flex items-center justify-center"
                      onMouseEnter={() => setShowPdfTooltip(true)}
                      onMouseLeave={() => setShowPdfTooltip(false)}
                    >
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <Icon name="upload" size={32} className="text-gray-600" />
                    </label>
                    {showPdfTooltip && (
                      <Tooltip>
                        <div>PDF는 10장까지</div>
                        <div>가능합니다.</div>
                      </Tooltip>
                    )}
                  </div>
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

            <a
              href="/wrong-quizzes"
              className="bg-white px-l py-4 rounded-[12px] shadow-sm hover:shadow-md transition-shadow flex items-center gap-1"
            >
              <Icon name="write" size={28} />
              <span className="text-body1-medium text-gray-900">
                틀린문제 풀어보기
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col items-center pt-41 pb-[180px] px-margin-mobile">
        {/* Character Images - Mobile */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="flex gap-[7px] relative z-10">
            <img
              src="/characters/character1.png"
              alt="캐릭터 1"
              className="w-[60px] h-[60px] animate-[bounce_2s_ease-in-out_infinite]"
            />
            <img
              src="/characters/character2.png"
              alt="캐릭터 2"
              className="w-[66px] h-[60px] animate-[bounce_2s_ease-in-out_0.2s_infinite]"
            />
            <img
              src="/characters/character3.png"
              alt="캐릭터 3"
              className="w-[60px] h-[60px] animate-[bounce_2s_ease-in-out_0.4s_infinite]"
            />
            <img
              src="/characters/character4.png"
              alt="캐릭터 4"
              className="w-[60px] h-[60px] animate-[bounce_2s_ease-in-out_0.6s_infinite]"
            />
          </div>
          <div className="absolute top-[50px] w-[280px] h-[10px] bg-gray-400 rounded-full blur-sm opacity-75 z-0"></div>
        </div>

        {/* Title - Mobile - 무한 슬라이드 애니메이션 */}
        <div className="h-[96px] mb-2 overflow-hidden relative">
          <div
            className={isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}
            style={{ transform: `translateY(-${currentTextIndex * 96}px)` }}
          >
            {[...heroTextsMobile, heroTextsMobile[0]].map((text, index) => (
              <h1
                key={index}
                className="text-header3-bold text-gray-900 text-center h-[96px] px-4"
                style={{ lineHeight: '1.4', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                {text.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>
                    {line.split(/(\([^)]+\))/).map((part, partIndex) => {
                      if (!part) return null;
                      if (part.match(/^\([^)]+\)$/)) {
                        return (
                          <span key={partIndex} className="text-primary">
                            {part.slice(1, -1)}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </div>
                ))}
              </h1>
            ))}
          </div>
        </div>

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

          <a
            href="/wrong-quizzes"
            className="bg-white px-3 py-[10px] rounded-[8px] shadow-sm flex items-center gap-1"
          >
            <Icon name="write" size={24} />
            <span className="text-tint-regular text-gray-900">
              틀린문제 풀어보기
            </span>
          </a>
        </div>
      </main>

      {/* Fixed Bottom Input - Mobile Only */}
      <div
        className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white rounded-t-[30px] shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.06)] z-50"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="pt-6 px-5 pb-6 flex flex-col">
          {file ? (
            <div className="flex items-start gap-1 min-h-[67.2px]">
              <span className="text-body3-regular text-gray-600">
                {file.name}
              </span>
              <button
                onClick={handleClearSearch}
                className="flex items-center justify-center shrink-0 -mt-[1px]"
                aria-label="파일 삭제"
              >
                <Icon name="delete" size={20} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <textarea
              ref={mobileTextareaRef}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="정리한 내용을 입력하거나 파일을 업로드 해주세요."
              rows={3}
              className="w-full text-body3-regular text-gray-900 placeholder:text-gray-600 outline-none bg-transparent resize-none overflow-y-hidden min-h-[67.2px]"
            />
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            {file ? (
              <button
                onClick={handleOpenQuizCreateModal}
                className="flex items-center justify-center"
                aria-label="보내기"
              >
                <Icon name="send_black" size={24} />
              </button>
            ) : searchText ? (
              <button
                onClick={handleOpenQuizCreateModal}
                className="flex items-center justify-center"
                aria-label="보내기"
              >
                <Icon name="send_black" size={24} />
              </button>
            ) : (
              <label className="cursor-pointer flex items-center justify-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
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

      {/* Mock Exam Setting Modal */}
      <MockExamSettingModal
        isOpen={isMockExamModalOpen}
        onClose={handleCloseMockExamModal}
        onSubmit={handleMockExamSubmit}
      />

      {/* Quiz Generation Loading Page */}
      <QuizGenerationLoadingPage
        isLoading={isPending || isMockExamPending || isMockExamFilePending}
        onComplete={handleLoadingComplete}
      />
    </div>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
