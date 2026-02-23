import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout';
import { Icon } from '@/components/common';
import { authUtils } from '@/lib/auth';
import { saveOnboarding } from '@/api/account';

type UserType = 'highschool' | 'university' | 'jobseeker' | 'general' | null;
type LearningGoal = 
  | 'weak-concept' 
  | 'wrong-answer' 
  | 'practice' 
  | 'summary' 
  | 'routine' 
  | 'accuracy';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);
  const [step1Completed, setStep1Completed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userTypes = [
    { id: 'highschool' as const, label: '고등학생', character: '/characters/character1.png' },
    { id: 'university' as const, label: '대학(원)생', character: '/characters/character2.png' },
    { id: 'jobseeker' as const, label: '취준생', character: '/characters/character3.png' },
    { id: 'general' as const, label: '일반 학습자', character: '/characters/character4.png' },
  ];

  const learningGoals = [
    { id: 'weak-concept' as const, label: '취약 개념 복습' },
    { id: 'wrong-answer' as const, label: '오답 관리' },
    { id: 'practice' as const, label: '실전 대비' },
    { id: 'summary' as const, label: '요약문 문제 풀이' },
    { id: 'routine' as const, label: '반복 학습 루틴 만들기' },
    { id: 'accuracy' as const, label: '정답률 향상 목표' },
  ];

  const handleUserTypeSelect = useCallback((type: UserType) => {
    setSelectedUserType(type);
  }, []);

  const handleGoalToggle = useCallback((goal: LearningGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1 && selectedUserType) {
      setStep1Completed(true);
      setStep(2);
    }
  }, [step, selectedUserType]);

  const handlePrev = useCallback(() => {
    if (step === 2) {
      setStep(1);
    }
  }, [step]);

  const handleComplete = useCallback(async () => {
    if (!selectedUserType || selectedGoals.length === 0) {
      return;
    }

    const startTime = Date.now();
    setIsLoading(true);

    try {
      await saveOnboarding({
        targetType: selectedUserType,
        studyGoal: selectedGoals.join(','),
      });
      
      // 온보딩 완료 후 임시 토큰을 정식 토큰으로 전환 (로그인 완료 처리)
      authUtils.activateTempToken();
      
      // UserContext에 인증 상태 변경 알림
      window.dispatchEvent(new Event('authStateChanged'));
      
      // 최소 1초 로딩 화면 표시
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      navigate('/', { replace: true });
    } catch (error) {
      setIsLoading(false);
      alert(`온보딩 정보 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [navigate, selectedUserType, selectedGoals]);

  const isStep1NextDisabled = !selectedUserType;
  const isStep2NextDisabled = selectedGoals.length === 0;

  // 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-home">
        <div className="text-center">
          <h2 className="text-header3-bold text-gray-900 mb-4">
            로그인 처리 중...
          </h2>
          <p className="text-body3-regular text-gray-600">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-home flex flex-col overflow-hidden max-md:overflow-hidden">
      <Header logoUrl="/logo.svg" />

      <main className="flex-1 flex justify-center px-6 overflow-y-auto max-md:overflow-hidden max-md:relative">
        <div className="flex flex-col items-center max-md:pt-[20px] md:pt-[60px] max-md:pb-[106px] max-md:h-full w-full max-w-[700px] md:pb-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-[47px] max-md:mb-[20px] max-md:shrink-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 max-md:gap-2" style={{ width: '91px', height: '80px' }}>
              <div className="relative flex items-center justify-center w-[46px] h-[46px] max-md:w-[32px] max-md:h-[32px]">
                {step > 1 ? (
                  <Icon name="icn_check_fill_in" size={46} className="max-md:w-[32px] max-md:h-[32px]" />
                ) : step === 1 ? (
                  <div className="w-[46px] h-[46px] max-md:w-[32px] max-md:h-[32px] rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[20px] max-md:text-[16px] font-medium text-white">1</span>
                  </div>
                ) : (
                  <div className="w-[46px] h-[46px] max-md:w-[32px] max-md:h-[32px] rounded-full bg-white border border-[#dedede] flex items-center justify-center">
                    <span className="text-[20px] max-md:text-[16px] font-medium text-[#b7b7b7]">1</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[16px] max-md:text-[14px] font-medium max-md:font-normal whitespace-nowrap ${
                  step >= 1 ? 'text-primary' : 'text-[#b7b7b7]'
                }`}
              >
                이용 대상 선택
              </span>
            </div>

            {/* Line */}
            <div className="w-[50px] max-md:w-[32px] h-0 border-t border-[#dedede] max-md:mx-2 md:mx-5" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 max-md:gap-2" style={{ width: '91px', height: '80px' }}>
              <div className="relative flex items-center justify-center w-[46px] h-[46px] max-md:w-[32px] max-md:h-[32px]">
                {selectedGoals.length > 0 ? (
                  <Icon name="icn_check_fill_in" size={46} className="max-md:w-[32px] max-md:h-[32px]" />
                ) : step === 2 ? (
                  <div className="w-[46px] h-[46px] max-md:w-[32px] max-md:h-[32px] rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[20px] max-md:text-[16px] font-medium text-white">2</span>
                  </div>
                ) : (
                  <div className="w-[46px] h-[46px] max-md:w-[32px] max-md:h-[32px] rounded-full bg-white border border-[#dedede] flex items-center justify-center">
                    <span className="text-[20px] max-md:text-[16px] font-medium text-[#b7b7b7]">2</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[16px] max-md:text-[14px] font-medium max-md:font-normal whitespace-nowrap ${
                  step === 2 || selectedGoals.length > 0 || selectedUserType ? 'text-primary' : 'text-[#b7b7b7]'
                }`}
              >
                학습 목표 선택
              </span>
            </div>
          </div>

          {/* Content Box */}
          <div className={`bg-white rounded-[24px] border border-[#dedede] w-full max-w-[700px] max-md:max-w-[335px] max-md:w-[335px] max-md:mx-auto relative flex flex-col items-center max-md:shrink-0 ${step === 1 ? 'max-md:h-[364px]' : 'max-md:h-[492px]'}`}>
            {/* Step 1: User Type Selection */}
            {step === 1 && (
              <>
                <div
                  className="flex items-center justify-center w-full max-md:mt-[30px] md:mt-[60px] px-4"
                >
                  <h1
                    className="onboarding-title max-md:font-semibold text-gray-900 text-center max-md:whitespace-nowrap"
                    style={{ lineHeight: '28px' }}
                  >
                    퀴즐리에 오신 것을 환영합니다!👋🏻
                  </h1>
                </div>
                <p
                  className="text-body3-regular text-gray-600 text-center max-md:mt-[4px] md:mt-[6px] max-md:mb-[30px] md:mb-[40px]"
                  style={{ lineHeight: '22.4px' }}
                >
                  어떤 분이 이용하시나요?
                </p>

                <div className="grid grid-cols-2 gap-3 max-md:gap-2 w-full max-w-[580px] max-md:mb-0 max-md:px-4 max-md:justify-center">
                  {userTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleUserTypeSelect(type.id)}
                      className={`flex flex-col items-center justify-center gap-4 max-md:gap-2 rounded-[16px] border transition-colors max-md:w-[132px] max-md:h-[104px] md:w-[284px] md:h-[148px] ${
                        selectedUserType === type.id
                          ? 'bg-white border-primary'
                          : 'bg-white border-[#ededed] hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={type.character}
                        alt={type.label}
                        className={type.id === 'university' ? 'w-[57px] h-[52px] max-md:w-[40px] max-md:h-[36px]' : 'w-[52px] h-[52px] max-md:w-[36px] max-md:h-[36px]'}
                      />
                      <span className="text-body2-medium max-md:text-[16px] text-gray-900">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="w-full max-w-[580px] flex justify-end mt-5 mb-[60px] max-md:hidden">
                  <button
                    onClick={handleNext}
                    disabled={isStep1NextDisabled}
                    className={`px-4 py-3 rounded-[6px] text-body3-regular text-white transition-colors ${
                      isStep1NextDisabled
                        ? 'bg-[#b7b7b7] cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    다음 질문
                  </button>
                </div>
              </>
            )}

          {/* Step 2: Learning Goals Selection */}
          {step === 2 && (
            <>
              <div 
                className="flex items-center justify-center w-full max-md:mt-[30px] md:mt-[60px]"
              >
                <h1 
                  className="onboarding-title max-md:font-semibold text-gray-900 text-center max-md:px-4"
                  style={{ lineHeight: '28px' }}
                >
                  학습 목표를 선택해주세요
                </h1>
              </div>
              <p
                className="text-body3-regular text-gray-600 text-center max-md:mt-[4px] md:mt-[6px] max-md:mb-[30px] md:mb-[40px]"
                style={{ lineHeight: '22.4px' }}
              >
                중복 선택이 가능합니다.
              </p>

              <div className="flex flex-col gap-2 max-md:mb-0 w-full max-w-[580px] max-md:max-w-[275px] max-md:mx-auto">
                {learningGoals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`flex items-center gap-3 p-3 rounded-[12px] border text-left transition-colors w-full max-md:h-[52px] md:h-[56px] ${
                        isSelected
                          ? 'bg-[#fcfcfc] border-primary'
                          : 'bg-[#fcfcfc] border-[#ededed] hover:border-primary/50'
                      }`}
                    >
                      <Icon
                        name={isSelected ? 'icn_check_fill_in' : 'icn_check_fill'}
                        size={28}
                        className="shrink-0"
                      />
                      <span className="text-body3-regular text-gray-900">
                        {goal.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="w-full max-w-[580px] flex justify-end mt-5 mb-[60px] max-md:hidden">
                <div className="flex gap-3">
                  <button
                    onClick={handlePrev}
                    className="px-4 py-3 rounded-[6px] bg-white border border-[#d9d9d9] text-body3-regular text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    이전 질문
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isStep2NextDisabled}
                    className={`px-4 py-3 rounded-[6px] text-body3-regular text-white transition-colors ${
                      isStep2NextDisabled
                        ? 'bg-[#b7b7b7] cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    시작하기
                  </button>
                </div>
              </div>
            </>
          )}
          </div>

          {/* Mobile Bottom Button - Step 1 */}
          {step === 1 && (
            <div className="hidden max-md:block bg-white max-md:shrink-0 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full" style={{ height: '106px', maxWidth: '375px', margin: '0 auto', zIndex: 10 }}>
              <div className="flex items-center justify-center h-full" style={{ paddingTop: '16px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '41px' }}>
                <button
                  onClick={handleNext}
                  disabled={isStep1NextDisabled}
                  className={`w-full h-[49px] rounded-[6px] text-[18px] text-white transition-colors ${
                    isStep1NextDisabled
                      ? 'bg-[#b7b7b7] cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  다음 질문
                </button>
              </div>
            </div>
          )}

          {/* Mobile Bottom Button - Step 2 */}
          {step === 2 && (
            <div className="hidden max-md:block bg-white max-md:shrink-0 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full" style={{ height: '106px', maxWidth: '375px', margin: '0 auto', zIndex: 10 }}>
              <div className="flex items-center justify-center h-full" style={{ paddingTop: '16px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '41px' }}>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handlePrev}
                    className="flex-1 h-[49px] rounded-[6px] bg-white border border-[#d9d9d9] text-[18px] text-[#777777] hover:bg-gray-50 transition-colors"
                  >
                    이전 질문
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isStep2NextDisabled}
                    className={`flex-1 h-[49px] rounded-[6px] text-[18px] text-white transition-colors ${
                      isStep2NextDisabled
                        ? 'bg-[#b7b7b7] cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    시작하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

OnboardingPage.displayName = 'OnboardingPage';

export default OnboardingPage;
