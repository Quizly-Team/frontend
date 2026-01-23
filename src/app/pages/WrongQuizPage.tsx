import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Header, Icon, Modal } from '@/components';
import { authUtils } from '@/lib/auth';
import { getWrongQuizzes, updateQuizzesTopic } from '@/api/quiz';
import type {
  WrongQuizGroupResponse,
  WrongQuizHistoryDetail,
  WrongQuizGroup,
} from '@/types/quiz';

const GROUP_TYPE_OPTIONS: Array<{ label: string; value: 'date' | 'topic' }> = [
  { label: '날짜순', value: 'date' },
  { label: '주제순', value: 'topic' },
];

const GROUP_TYPE_LABEL: Record<'date' | 'topic', string> = {
  date: '날짜순',
  topic: '주제순',
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
  const [activeMenuGroup, setActiveMenuGroup] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState<WrongQuizGroup | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [formMessage, setFormMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<WrongQuizGroupResponse, Error>({
    queryKey: ['wrong-quizzes', groupType],
    queryFn: () => getWrongQuizzes(groupType),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
  });

  const quizGroups = useMemo(() => {
    const groups = data?.quizGroupList ?? [];
    // 날짜순일 때 최신순 정렬 적용
    if (groupType === 'date') {
      return [...groups].sort((a, b) => b.group.localeCompare(a.group));
    }
    return groups;
  }, [data, groupType]);
  const targetQuizCount = targetGroup?.quizHistoryDetailList.length ?? 0;
  const trimmedTopicInput = topicInput.trim();
  const cardBaseClass =
    'relative w-full max-w-[312px] h-[144px] rounded-[12px] border border-[#ededed] bg-white px-[40px] pt-[40px] pb-[16px] text-left shadow-[4px_4px_12px_0px_rgba(0,0,0,0.04)] transition-colors hover:border-primary flex flex-col max-lg:max-w-[288px] max-lg:h-[152px] max-lg:px-[26px] max-lg:pt-[48px] max-lg:pb-[20px] max-md:max-w-[335px] max-md:h-[149px] max-md:mx-auto';
  const isSubmitDisabled =
    !targetGroup ||
    !trimmedTopicInput ||
    trimmedTopicInput === targetGroup.group ||
    isSubmitting ||
    targetQuizCount === 0;

  useEffect(() => {
    if (!error) return;
    const isAuthError =
      error.message.includes('로그인이 필요') || error.message.includes('인증');
    if (isAuthError) {
      authUtils.logout();
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [error, navigate]);

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

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleMenuClose = () => {
      setActiveMenuGroup(null);
    };

    document.addEventListener('click', handleMenuClose);
    return () => {
      document.removeEventListener('click', handleMenuClose);
    };
  }, []);

  const handleGroupTypeChange = useCallback((value: 'date' | 'topic') => {
    setGroupType(value);
    setIsDropdownOpen(false);
    setActiveMenuGroup(null);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleTopicInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTopicInput(event.target.value);
      setIsTopicEdited(true);
      if (formMessage) {
        setFormMessage(null);
      }
    },
    [formMessage]
  );

  const handleOpenEditModal = useCallback((group: WrongQuizGroup) => {
    setTargetGroup(group);
    setTopicInput(group.group);
    setFormMessage(null);
    setIsEditModalOpen(true);
    setActiveMenuGroup(null);
    setIsTopicEdited(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setTargetGroup(null);
    setTopicInput('');
    setFormMessage(null);
    setIsSubmitting(false);
    setIsTopicEdited(false);
  }, []);

  const handleTopicSubmit = useCallback(async () => {
    if (!targetGroup) return;
    const nextTopic = trimmedTopicInput;

    if (!nextTopic) {
      setFormMessage({ type: 'error', text: '주제를 입력해주세요.' });
      return;
    }

    if (targetQuizCount === 0) {
      setFormMessage({ type: 'error', text: '수정할 문제가 없어요.' });
      return;
    }

    if (nextTopic === targetGroup.group) {
      setFormMessage({ type: 'error', text: '변경된 내용이 없어요.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateQuizzesTopic({
        topic: nextTopic,
        quizIdList: targetGroup.quizHistoryDetailList.map((quiz) => quiz.quizId),
      });
      setFormMessage({ type: 'success', text: '주제를 수정했어요!' });
      await refetch();

      setTimeout(() => {
        handleCloseEditModal();
      }, 800);
    } catch (submitError) {
      setFormMessage({
        type: 'error',
        text:
          submitError instanceof Error
            ? submitError.message
            : '주제 수정 중 문제가 발생했어요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    handleCloseEditModal,
    refetch,
    targetGroup,
    targetQuizCount,
    trimmedTopicInput,
  ]);

  const handleCardClick = useCallback(
    (quizzes: WrongQuizHistoryDetail[]) => {
      if (!quizzes.length) return;
      navigate('/wrong-quizzes/solve', {
        state: { quizzes },
      });
    },
    [navigate]
  );

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
            {error.message || '데이터를 불러오는 중 오류가 발생했어요.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
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
                <button
                  type="button"
                  aria-label={`${group.group} 더보기`}
                  className="absolute right-[16px] top-[16px] flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 max-lg:right-[26px] max-lg:top-[20px]"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveMenuGroup((prev) =>
                      prev === group.group ? null : group.group
                    );
                  }}
                >
                  <svg width="18" height="4" viewBox="0 0 18 4" fill="none">
                    <circle cx="2" cy="2" r="2" fill="currentColor" />
                    <circle cx="9" cy="2" r="2" fill="currentColor" />
                    <circle cx="16" cy="2" r="2" fill="currentColor" />
                  </svg>
                </button>

                {activeMenuGroup === group.group && (
                  <div
                    className="absolute right-0 top-10 z-30"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="w-[170px] rounded-[10px] border border-[#dedede] bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                      <button
                        type="button"
                        className="w-full rounded-[6px] px-3 py-2 text-left text-body3-medium text-gray-900 hover:bg-gray-50"
                        onClick={(event) => {
                          event.preventDefault();
                          handleOpenEditModal(group);
                        }}
                      >
                        주제 수정하기
                      </button>
                    </div>
                  </div>
                )}

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
        </div>
      </main>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="max-md:w-[300px] max-md:px-[24px] max-md:py-[40px] max-md:min-h-0"
      >
        <div className="w-full">
          <div className="flex flex-col gap-6 max-md:gap-[24px]">
            <h2 className="text-center text-header3-bold text-gray-900 max-md:text-[20px]">
              주제 수정하기
            </h2>

            <div className="flex flex-col gap-3">
              <div className="mx-auto w-[350px] max-md:w-full">
                <div className="flex flex-col items-start w-full">
                  <label className="text-[16px] font-medium text-[#777] mb-2 max-md:text-[14px]">
                    새로운 주제
                  </label>
                  <div className="w-full border-b border-[#dedede] py-[12px]">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={handleTopicInputChange}
                      placeholder={targetGroup?.group ?? '새로운 주제를 입력하세요'}
                      className="w-full text-[16px] text-gray-900 placeholder:text-[#9e9e9e] outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
              {formMessage && (
                <p
                  className={`text-body3-medium text-center ${
                    formMessage.type === 'error' ? 'text-error' : 'text-primary'
                  }`}
                >
                  {formMessage.text}
                </p>
              )}
            </div>

            <div className="mt-2 flex items-center justify-center gap-3 max-md:gap-[12px]">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="h-[46px] w-[120px] rounded-[6px] border border-[#dedede] bg-[#efefef] text-body3-regular text-gray-900 hover:bg-gray-200 disabled:opacity-60 max-md:h-[40px] max-md:w-[96px] max-md:rounded-[4px] max-md:text-[14px]"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleTopicSubmit}
                disabled={isSubmitDisabled}
                className="h-[46px] w-[120px] rounded-[6px] bg-primary text-body3-regular text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 max-md:h-[40px] max-md:w-[96px] max-md:rounded-[4px] max-md:text-[14px]"
              >
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

WrongQuizPage.displayName = 'WrongQuizPage';

export default WrongQuizPage;
