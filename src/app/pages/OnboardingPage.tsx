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
    { id: 'university' as const, label: '대학생', character: '/characters/character2.png' },
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
      
      // 최소 1초 로딩 화면 표시
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('온보딩 정보 저장 실패:', error);
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
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header logoUrl="/logo.svg" />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-[40px]">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4" style={{ width: '91px', height: '80px' }}>
              <div className="relative flex items-center justify-center w-[46px] h-[46px]">
                {step > 1 ? (
                  <Icon name="icn_check_fill_in" size={46} />
                ) : step === 1 ? (
                  <div className="w-[46px] h-[46px] rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[20px] font-medium text-white">1</span>
                  </div>
                ) : (
                  <div className="w-[46px] h-[46px] rounded-full bg-white border border-[#dedede] flex items-center justify-center">
                    <span className="text-[20px] font-medium text-[#b7b7b7]">1</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[16px] font-medium ${
                  step >= 1 ? 'text-primary' : 'text-[#b7b7b7]'
                }`}
              >
                이용 대상 선택
              </span>
            </div>

            {/* Line */}
            <div className="w-[50px] h-0 border-t border-[#dedede]" style={{ marginLeft: '20px', marginRight: '20px' }} />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4" style={{ width: '91px', height: '80px' }}>
              <div className="relative flex items-center justify-center w-[46px] h-[46px]">
                {selectedGoals.length > 0 ? (
                  <Icon name="icn_check_fill_in" size={46} />
                ) : step === 2 ? (
                  <div className="w-[46px] h-[46px] rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[20px] font-medium text-white">2</span>
                  </div>
                ) : (
                  <div className="w-[46px] h-[46px] rounded-full bg-white border border-[#dedede] flex items-center justify-center">
                    <span className="text-[20px] font-medium text-[#b7b7b7]">2</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[16px] font-medium ${
                  step === 2 || selectedGoals.length > 0 || selectedUserType ? 'text-primary' : 'text-[#b7b7b7]'
                }`}
              >
                학습 목표 선택
              </span>
            </div>
          </div>

          {/* Content Box */}
          <div className="bg-white rounded-[24px] border border-[#dedede] w-[700px] relative flex flex-col items-center" style={{ height: step === 1 ? '596px' : '684px' }}>
          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <>
              <div 
                className="flex items-center justify-center"
                style={{ width: '318px', height: '34px', marginTop: '60px', marginBottom: '6px' }}
              >
                <h1 
                  className="text-header3-bold text-gray-900"
                  style={{ lineHeight: '34px', whiteSpace: 'nowrap' }}
                >
                  퀴즐리에 오신 것을 환영합니다!👋🏻
                </h1>
              </div>
              <p 
                className="text-body3-regular text-gray-600 text-center"
                style={{ width: '154px', height: '22px', marginBottom: '40px' }}
              >
                어떤 분이 이용하시나요?
              </p>

              <div className="flex flex-wrap justify-center gap-4 w-full mb-12">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className={`flex flex-col items-center justify-center gap-4 rounded-[16px] border transition-colors ${
                      selectedUserType === type.id
                        ? 'bg-white border-primary'
                        : 'bg-white border-[#ededed] hover:border-primary/50'
                    }`}
                    style={{ width: '284px', height: '148px' }}
                  >
                    <img
                      src={type.character}
                      alt={type.label}
                      className={type.id === 'university' ? 'w-[57px] h-[52px]' : 'w-[52px] h-[52px]'}
                    />
                    <span className="text-body2-medium text-gray-900">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isStep1NextDisabled}
                className={`absolute w-[92px] h-[46px] rounded-[6px] text-body3-regular text-white transition-colors ${
                  isStep1NextDisabled
                    ? 'bg-[#b7b7b7] cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
                style={{ right: '60px', bottom: '60px' }}
              >
                다음 질문
              </button>
            </>
          )}

          {/* Step 2: Learning Goals Selection */}
          {step === 2 && (
            <>
              <div 
                className="flex items-center justify-center"
                style={{ width: '318px', height: '34px', marginTop: '60px', marginBottom: '6px' }}
              >
                <h1 
                  className="text-header3-bold text-gray-900 text-center"
                  style={{ lineHeight: '34px', whiteSpace: 'nowrap' }}
                >
                  학습 목표를 선택해주세요
                </h1>
              </div>
              <p 
                className="text-body3-regular text-gray-600 text-center"
                style={{ width: '154px', height: '22px', marginBottom: '40px' }}
              >
                중복 선택이 가능합니다.
              </p>

              <div className="flex flex-col gap-2 mb-12" style={{ width: '580px' }}>
                {learningGoals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-[12px] border text-left transition-colors ${
                        isSelected
                          ? 'bg-[#fcfcfc] border-primary'
                          : 'bg-[#fcfcfc] border-[#ededed] hover:border-primary/50'
                      }`}
                      style={{ width: '580px', height: '56px' }}
                    >
                      <Icon
                        name={isSelected ? 'icn_check_fill_in' : 'icn_check_fill'}
                        size={24}
                      />
                      <span className="text-body3-regular text-gray-900">
                        {goal.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePrev}
                className="absolute w-[92px] h-[46px] rounded-[6px] bg-white border border-[#d9d9d9] text-body3-regular text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ right: '152px', bottom: '60px' }}
              >
                이전 질문
              </button>
              <button
                onClick={handleComplete}
                disabled={isStep2NextDisabled}
                className={`absolute w-[88px] h-[46px] rounded-[6px] text-body3-regular text-white transition-colors ${
                  isStep2NextDisabled
                    ? 'bg-[#b7b7b7] cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
                style={{ right: '60px', bottom: '60px' }}
              >
                시작하기
              </button>
            </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
};

OnboardingPage.displayName = 'OnboardingPage';

export default OnboardingPage;
