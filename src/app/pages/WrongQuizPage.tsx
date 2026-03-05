import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Icon } from '@/components';
import { authUtils } from '@/lib/auth';
import { getWrongQuizzes } from '@/api/quiz';
import type { WrongQuizGroup, WrongQuizHistoryDetail } from '@/types/quiz';

const GROUP_TYPE_OPTIONS: Array<{ label: string; value: 'date' | 'topic' }> = [
  { label: '날짜순', value: 'date' },
  { label: '주제순', value: 'topic' },
];

const GROUP_TYPE_LABEL: Record<'date' | 'topic', string> = {
  date: '날짜순',
  topic: '주제순',
};

const PAGE_SIZE = 12;

const getPageNumbers = (currentPage: number, totalPages: number): (number | '...')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const WrongQuizPage = () => {
  const navigate = useNavigate();
  const [groupType, setGroupType] = useState<'date' | 'topic'>('date');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    authUtils.isAuthenticated()
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);
  const [quizGroups, setQuizGroups] = useState<WrongQuizGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWrongQuizzes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getWrongQuizzes(groupType, currentPage, PAGE_SIZE);
        setQuizGroups(response.quizGroupList ?? []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        const isAuthError =
          errorMessage.includes('로그인이 필요') || errorMessage.includes('인증');
        if (isAuthError) {
          authUtils.logout();
          setIsAuthenticated(false);
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWrongQuizzes();
  }, [isAuthenticated, groupType, currentPage, navigate]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      const refs = [desktopDropdownRef, mobileDropdownRef];
      const shouldClose = refs.every(
        (ref) => !ref.current || !ref.current.contains(event.target as Node)
      );

      if (shouldClose) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleGroupTypeChange = useCallback((value: 'date' | 'topic') => {
    setGroupType(value);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleCardClick = useCallback(
    (quizzes: WrongQuizHistoryDetail[]) => {
      if (!quizzes.length) return;
      navigate('/wrong-quizzes/solve', {
        state: { quizzes },
      });
    },
    [navigate]
  );

  const cardBaseClass =
    'relative w-full max-w-[312px] h-[144px] rounded-[12px] border border-[#ededed] bg-white px-[40px] pt-[40px] pb-[16px] text-left shadow-[4px_4px_12px_0px_rgba(0,0,0,0.04)] transition-colors hover:border-primary flex flex-col max-lg:max-w-[288px] max-lg:h-[152px] max-lg:px-[26px] max-lg:pt-[48px] max-lg:pb-[20px] max-md:max-w-[335px] max-md:h-[149px] max-md:mx-auto';

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const renderPagination = () => {
    if (isLoading || error || !quizGroups.length) return null;

    return (
      <div className="flex items-center justify-center gap-1 mt-10">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="이전 페이지"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-body3-medium text-gray-400"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-[6px] text-body3-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="다음 페이지"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  };

  const renderContent = (gridClassName: string) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-body1-medium text-gray-600">로딩 중...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-body1-medium text-error mb-4">
            {error || '데이터를 불러오는 중 오류가 발생했어요.'}
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage(currentPage)}
            className="bg-primary text-white text-body3-regular px-l py-3 rounded-[6px] hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (!quizGroups.length) {
      return (
        <div className="w-full rounded-[12px] border border-[#dedede] bg-white px-8 py-10 text-left shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <p className="text-body1-medium text-gray-900 mb-2">
            최근 틀린 문제가 아직 없어요.
          </p>
          <p className="text-body2-regular text-gray-600">
            문제를 풀고 다시 도전할 틀린 문제를 모아볼 수 있어요.
          </p>
        </div>
      );
    }

    if (groupType === 'topic') {
      return (
        <div className={gridClassName}>
          {quizGroups.map((group) => {
            const quizCount = group.quizHistoryDetailList.length;
            return (
              <button
                key={`${group.group}-topic`}
                type="button"
                onClick={() => handleCardClick(group.quizHistoryDetailList)}
                className={cardBaseClass}
              >
                <div className="flex flex-col gap-[24px] items-center w-full max-lg:gap-[20px]">
                  <div className="flex items-center justify-center gap-1 w-full">
                    <Icon name="icn_note" className="w-[28px] h-[28px] max-md:w-[24px] max-md:h-[24px]" />
                    <span className="text-[20px] font-medium text-gray-900 truncate max-w-[200px] max-md:text-[18px]">
                      {group.group}
                    </span>
                  </div>

                  <div className="w-full flex justify-end mr-[-44px] max-lg:mr-0">
                    <div className="inline-flex h-[36px] min-w-[105px] items-center justify-center rounded-[6px] bg-[#f6fbf4] px-3">
                      <span className="inline-flex min-w-[81px] h-[20px] items-center justify-center text-tint-regular text-primary">
                        틀린문제 {quizCount}개
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={gridClassName}>
        {quizGroups.map((group) => (
          <button
            key={`${group.group}-date`}
            type="button"
            onClick={() => handleCardClick(group.quizHistoryDetailList)}
            className={cardBaseClass}
          >
            <div className="flex flex-col gap-[24px] items-center w-full max-lg:gap-[20px]">
              <div className="flex items-center justify-center gap-1 w-full">
                <Icon name="calendar" className="w-[28px] h-[28px] max-md:w-[24px] max-md:h-[24px]" />
                <span className="text-[20px] font-medium text-gray-900 max-md:text-[18px]">
                  {group.group}
                </span>
              </div>
              <div className="w-full flex justify-end mr-[-48px] max-lg:mr-0">
                <div className="inline-flex h-[36px] min-w-[105px] items-center justify-center rounded-[6px] bg-[#f6fbf4] px-3">
                  <span className="inline-flex min-w-[81px] h-[20px] items-center justify-center text-tint-regular text-primary">
                    틀린문제 {group.quizHistoryDetailList.length}개
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  // 비회원인 경우 - 로그인 요구 페이지 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-home flex flex-col">
        <Header logoUrl="/logo.svg" />

        {/* Main Content - Web/Tablet */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 max-md:hidden">
          {/* Character Images */}
          <div className="flex gap-[15px] mb-10">
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

          {/* Title */}
          <h1 className="text-header1-bold text-gray-900 text-center mb-4">
            틀린 문제를 확인하려면 회원가입 또는 로그인이 필요해요
          </h1>

          {/* Description */}
          <p className="text-body1-regular text-gray-600 text-center mb-10">
            퀴즐리 계정이 없다면 지금 바로 회원가입을 해보세요.
          </p>

          {/* Sign Up Button */}
          <button
            onClick={handleLoginClick}
            className="bg-primary text-white text-body3-regular px-l py-4 rounded-[6px] hover:bg-primary/90 transition-colors"
          >
            지금 가입하기
          </button>
        </main>

        {/* Main Content - Mobile */}
        <main className="hidden max-md:flex flex-1 flex-col items-center justify-center px-5">
          {/* Character Images */}
          <div className="flex gap-[7px] mb-6">
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

          {/* Title */}
          <h1 className="text-header3-bold text-gray-900 text-center mb-3">
            틀린 문제를 확인하려면 회원가입
            <br />
            또는 로그인이 필요해요
          </h1>

          {/* Description */}
          <p className="text-body3-regular text-gray-600 text-center mb-8">
            퀴즐리 계정이 없다면 지금 바로 회원가입을 해보세요.
          </p>

          {/* Sign Up Button */}
          <button
            onClick={handleLoginClick}
            className="bg-primary text-white text-body3-regular px-l py-[14px] rounded-[6px] hover:bg-primary/90 transition-colors"
          >
            지금 가입하기
          </button>
        </main>
      </div>
    );
  }

  // 회원인 경우 - 틀린문제 목록 표시
  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header logoUrl="/logo.svg" />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-[60px] max-md:hidden">
        <div className="w-full max-w-[904px] xl:max-w-[976px]">
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-center gap-3 text-center">
              <h1 className="text-header1-bold text-gray-900">
                <span className="text-primary">틀린문제</span> 다시 한번 풀어봐요
              </h1>
              <Icon name="icn_checkbox" size={40} />
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <div className="relative w-[120px]" ref={desktopDropdownRef}>
              <button
                type="button"
                onClick={handleDropdownToggle}
                className="flex w-full items-center justify-between rounded-[6px] border border-[#dedede] bg-white py-3 px-4 text-left text-body2-regular text-gray-900 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                {GROUP_TYPE_LABEL[groupType]}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`text-gray-600 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-full rounded-[10px] border border-[#dedede] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                  {GROUP_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleGroupTypeChange(option.value)}
                      className={`w-full px-4 py-3 text-left text-body3-medium transition-colors ${
                        option.value === groupType
                          ? 'text-primary'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            {renderContent('grid grid-cols-3 gap-[20px]')}
            {renderPagination()}
          </div>
        </div>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col pt-[20px] pb-[120px] px-5">
        <div className="flex flex-col items-center gap-0 mb-[12px]">
          <div className="flex items-center gap-2">
            <h1 className="text-header3-bold text-gray-900">
              <span className="text-primary">틀린문제</span> 다시
            </h1>
            <Icon name="icn_checkbox" size={28} />
          </div>
          <h1 className="text-header3-bold text-gray-900">한번 풀어봐요</h1>
        </div>

        <div className="flex justify-end mb-[20px]">
          <div className="relative w-[97px]" ref={mobileDropdownRef}>
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="flex w-full items-center justify-between rounded-[6px] border border-[#dedede] bg-white py-3 px-4 text-left text-body3-medium text-gray-900 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              {GROUP_TYPE_LABEL[groupType]}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`text-gray-600 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-full rounded-[10px] border border-[#dedede] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                {GROUP_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleGroupTypeChange(option.value)}
                    className={`w-full px-4 py-3 text-left text-body3-medium transition-colors ${
                      option.value === groupType
                        ? 'text-primary'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full">
          {renderContent('grid grid-cols-1 gap-3 w-full')}
          {renderPagination()}
        </div>
      </main>
    </div>
  );
};

WrongQuizPage.displayName = 'WrongQuizPage';

export default WrongQuizPage;
