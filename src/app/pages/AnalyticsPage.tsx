import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, Button } from '@/components';
import { authUtils } from '@/lib/auth';
import {
  getUserInfo,
  updateNickname,
  updateProfileImage,
  logout,
  type ReadUserInfoResponse,
} from '@/api/account';
import { useUser } from '@/contexts/UserContext';
import { useDashboardStats } from '@/hooks/useDashboard';
import TodaySummary from '@/components/dashboard/today-summary';
import CumulativeSummary from '@/components/dashboard/cumulative-summary';
import QuizTypeChart from '@/components/dashboard/quiz-type-chart';
import HourlyChart from '@/components/dashboard/hourly-chart';
import TopicChart from '@/components/dashboard/topic-chart';
import LearningStats from '@/components/dashboard/learning-stats';

type TabType = 'analytics' | 'account';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { userInfo: contextUserInfo, refreshUserInfo } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [userInfo, setUserInfo] = useState<ReadUserInfoResponse | null>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = authUtils.isAuthenticated();

  // 대시보드 통계 조회
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboardStats();


  // 사용자 정보 조회 (Context에서 가져오거나 직접 조회)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = contextUserInfo || await getUserInfo();
        setUserInfo(data);
        setNickname(data.nickName || '');
        setEmail(data.email || '');
        setProfileImageUrl(data.profileImageUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : '유저 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [isAuthenticated, navigate, contextUserInfo]);

  if (!isAuthenticated) {
    return null;
  }

  // 학습분석 데이터는 나중에 API로 연결 예정

  // 미리보기 이미지 URL 정리
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증 (이미지 파일만 허용)
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (예: 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 이전 미리보기 URL 정리
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }

    // 파일 저장 및 미리보기 URL 생성
    setSelectedFile(file);
    setPreviewImageUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      setSaveError('닉네임을 입력해주세요.');
      return;
    }

    // 닉네임 길이 검증 (6자 제한)
    if (nickname.length > 6) {
      setSaveError('닉네임은 6자까지 입력 가능합니다.');
      return;
    }

    // 변경사항이 있는지 확인
    const hasNicknameChange = userInfo && nickname !== userInfo.nickName;
    const hasImageChange = selectedFile !== null;

    if (!hasNicknameChange && !hasImageChange) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // 프로필 이미지가 선택된 경우 먼저 업로드
      if (hasImageChange && selectedFile) {
        await updateProfileImage(selectedFile);
      }

      // 닉네임이 변경된 경우 업데이트
      if (hasNicknameChange) {
        await updateNickname({ nickName: nickname });
      }

      // 성공 시 사용자 정보 다시 조회하여 최신 데이터로 업데이트
      const updatedData = await getUserInfo();
      setUserInfo(updatedData);
      setNickname(updatedData.nickName || '');
      setProfileImageUrl(updatedData.profileImageUrl);

      // Context의 유저 정보도 업데이트 (Header에 즉시 반영)
      await refreshUserInfo();

      // 미리보기 정리
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
      setSelectedFile(null);

      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('변경사항이 저장되었습니다.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '변경사항 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) {
      return;
    }

    try {
      await logout();
      // 로그아웃 성공 시 홈으로 이동
      navigate('/', { replace: true });
      window.location.reload();
    } catch (err) {
      // API 호출 실패해도 클라이언트 측 토큰은 제거하고 로그아웃 처리
      authUtils.removeAllTokens();
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-home flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-[60px] max-lg:px-10 max-md:px-5 max-md:pt-5">
        <div className="w-full max-w-[1024px] max-lg:max-w-full max-md:max-w-full">
          {/* 탭 헤더 */}
          <div className="mb-[30px] max-md:mb-[31px]">
            <div className="flex items-center gap-6 max-lg:gap-4 max-md:gap-4 mb-[6px] max-md:mb-5">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`text-[32px] max-lg:text-[28px] max-md:text-[24px] font-bold leading-[44.8px] max-lg:leading-[39.2px] max-md:leading-[33.6px] ${
                  activeTab === 'analytics' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                학습분석
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`text-[32px] max-lg:text-[28px] max-md:text-[24px] font-bold leading-[44.8px] max-lg:leading-[39.2px] max-md:leading-[33.6px] ${
                  activeTab === 'account' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                계정관리
              </button>
            </div>
            <p className="text-[20px] max-lg:text-[18px] max-md:text-[16px] leading-[28px] max-lg:leading-[25.2px] max-md:leading-[22.4px] text-gray-600">
              학습 현황을 확인하고 계정을 관리하세요
            </p>
          </div>

        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-5 max-md:gap-[20px]">
            {isDashboardLoading ? (
              <div className="bg-white rounded-2xl p-8 max-md:p-5 border border-gray-300 max-md:border-[#dedede]">
                <div className="flex justify-center items-center py-20">
                  <p className="text-gray-600">로딩 중...</p>
                </div>
              </div>
            ) : dashboardError ? (
              <div className="bg-white rounded-2xl p-8 max-md:p-5 border border-gray-300 max-md:border-[#dedede]">
                <div className="flex justify-center items-center py-20">
                  <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
                </div>
              </div>
            ) : dashboardData ? (
              <>
                {/* 모바일: 가로 스크롤 가능한 카드 컨테이너 */}
                <div className="hidden max-md:block">
                  <div className="overflow-x-auto -mx-5 px-5">
                    <div className="flex gap-[20px] min-w-max pb-2">
                      <div className="flex-shrink-0 w-[250px]">
                        <TodaySummary data={dashboardData.todaySummary} dailyData={dashboardData.dailySummaryList} />
                      </div>
                      <div className="flex-shrink-0 w-[250px]">
                        <CumulativeSummary data={dashboardData.cumulativeSummary} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* PC: 오늘의 학습 요약 */}
                <div className="max-md:hidden">
                  <TodaySummary data={dashboardData.todaySummary} dailyData={dashboardData.dailySummaryList} />
                </div>

                {/* AI 학습 분석 */}
                <div className="bg-[#eff6ff] border border-[#4f8fff] rounded-[16px] px-[45px] py-[35px] max-md:px-[20px] max-md:py-[20px] w-full max-w-[976px] max-lg:max-w-[904px] max-md:max-w-full">
                  <div className="flex items-center gap-[6px] mb-[22px] max-md:mb-[15px]">
                    <div className="w-[24px] h-[24px] max-md:w-[20px] max-md:h-[20px] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-md:w-[20px] max-md:h-[20px]">
                        <circle cx="12" cy="12" r="10.5" stroke="#0053e2" strokeWidth="1.5"/>
                        <circle cx="12" cy="9" r="1.5" fill="#0053e2"/>
                        <rect x="11" y="13" width="2" height="4" rx="1" fill="#0053e2"/>
                      </svg>
                    </div>
                    <h3 className="text-[20px] max-md:text-[18px] font-medium text-[#0053e2]">
                      <span className="max-md:hidden">체험판 AI 학습 분석</span>
                      <span className="hidden max-md:inline">AI 학습 분석</span>
                    </h3>
                  </div>
                  <p className="text-[16px] max-md:text-[14px] leading-[22.4px] max-md:leading-[19.6px] text-[#0053e2]">
                    {(() => {
                      const aiResult = dashboardData.aiAnalysisResult;
                      if (aiResult === undefined || aiResult === null) {
                        return 'AI 분석 데이터를 불러오는 중입니다...';
                      }
                      const resultString = typeof aiResult === 'string' ? aiResult : String(aiResult);
                      return resultString.trim() !== '' ? resultString : 'AI 분석 데이터를 불러오는 중입니다...';
                    })()}
                  </p>
                </div>

                {/* PC: 누적 통계 */}
                <div className="max-md:hidden">
                  <CumulativeSummary data={dashboardData.cumulativeSummary} />
                </div>

                {/* 일별 학습 히트맵 및 학습 통계 */}
                <LearningStats
                  dailyData={dashboardData.dailySummaryList}
                  quizTypeData={dashboardData.quizTypeSummaryList}
                  hourlyData={dashboardData.hourlySummaryList}
                />

                {/* 유형별/시간대별 차트 */}
                <div className="flex gap-5 max-md:flex-col max-md:gap-[20px]">
                  <div className="min-w-0 flex-1 max-w-[478px] max-lg:max-w-[442px] max-md:max-w-full">
                    <QuizTypeChart data={dashboardData.quizTypeSummaryList} />
                  </div>
                  {/* 모바일에서 시간대별 차트 숨김 */}
                  <div className="min-w-0 flex-1 max-w-[478px] max-lg:max-w-[442px] max-md:hidden">
                    <HourlyChart data={dashboardData.hourlySummaryList} nickname={userInfo?.nickName} />
                  </div>
                </div>

                {/* 주제별 차트 - 모바일에서 숨김 */}
                <div className="max-md:hidden">
                  <TopicChart data={dashboardData.topicSummaryList} />
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl max-md:rounded-[16px] p-8 max-md:p-5 border border-gray-300 max-md:border-[#dedede]">
            <h2 className="text-[20px] font-medium leading-[28px] mb-[30px] max-md:mb-[20px] text-gray-900">
              프로필 정보
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <p className="text-gray-600">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-20">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                {/* 프로필 이미지 */}
                <div className="flex items-center justify-center gap-6 mb-[30px] max-md:mb-[20px]">
                  <div className="relative">
                    <div className="w-[110px] h-[110px] max-md:w-[80px] max-md:h-[80px] rounded-full border-2 border-primary overflow-hidden">
                      {previewImageUrl ? (
                        // 미리보기 이미지 표시
                        <img
                          src={previewImageUrl}
                          alt="프로필 미리보기"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src={profileImageUrl || '/icon/default.svg'}
                          alt="프로필"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== `${window.location.origin}/icon/default.svg`) {
                              target.src = '/icon/default.svg';
                            }
                          }}
                        />
                      )}
                    </div>
                    <button
                      onClick={handleProfileImageClick}
                      disabled={isSaving}
                      className="absolute bottom-0 right-0 w-[26px] h-[26px] max-md:w-[22px] max-md:h-[22px] rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="프로필 이미지 변경"
                    >
                      <img
                        src="/icon/icn_write.svg"
                        alt="프로필 이미지 변경"
                        className="w-4 h-4 max-md:w-3 max-md:h-3"
                      />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

            {/* 닉네임 입력 */}
            <div className="mb-[20px] max-md:mb-[20px] flex flex-col items-center">
              <div className="flex flex-col items-start w-[350px] max-md:w-[295px]">
                <label className="text-[16px] font-medium text-gray-600 mb-1">
                  닉네임
                </label>
                <div className="border-b border-[#dedede] flex items-center w-full py-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // 6자까지만 입력 가능
                      if (newValue.length <= 6) {
                        setNickname(newValue);
                        setSaveError(null);
                      }
                    }}
                    maxLength={6}
                    disabled={isSaving}
                    className="flex-1 text-[16px] text-gray-900 outline-none bg-transparent disabled:text-gray-500"
                  />
                </div>
                {saveError && (
                  <p className="mt-1 text-[14px] text-red-500">
                    {saveError}
                  </p>
                )}
              </div>
            </div>

            {/* 이메일 입력 (비활성화) */}
            <div className="mb-[30px] max-md:mb-[20px] flex flex-col items-center">
              <div className="flex flex-col items-start w-[350px] max-md:w-[295px]">
                <label className="text-[16px] font-medium text-gray-600 mb-1">
                  이메일
                </label>
                <div className="border-b border-[#dedede] flex items-center w-full py-2">
                  <input
                    type="text"
                    value={email}
                    disabled
                    className="flex-1 text-[16px] text-gray-900 outline-none bg-transparent disabled:text-gray-500"
                  />
                </div>
                <p className="mt-1 text-[14px] text-red-500">
                  이메일은 변경할 수 없습니다.
                </p>
              </div>
            </div>

                {/* 저장 및 로그아웃 버튼 */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={handleLogout}
                    className="w-[120px] h-[46px] rounded-md bg-[#f6fbf4] text-primary hover:bg-[#e8f5e0]"
                  >
                    로그아웃
                  </Button>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-[120px] h-[46px] rounded-md"
                  >
                    {isSaving ? '저장 중...' : '변경사항 저장'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalyticsPage;

