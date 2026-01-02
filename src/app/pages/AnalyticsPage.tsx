import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, Button, Input } from '@/components';
import { authUtils } from '@/lib/auth';
import {
  getUserInfo,
  updateNickname,
  updateProfileImage,
  logout,
  type ReadUserInfoResponse,
} from '@/api/account';
import { useUser } from '@/contexts/UserContext';

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
        console.error('유저 정보 조회 실패:', err);
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
      console.error('변경사항 저장 실패:', err);
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
      console.error('로그아웃 실패:', err);
      // API 호출 실패해도 클라이언트 측 토큰은 제거하고 로그아웃 처리
      authUtils.removeAllTokens();
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center pt-10 pb-24 px-[60px] max-lg:px-15 max-md:px-margin-mobile max-md:pt-6">
        <div className="w-full max-w-[1024px]">
          {/* 탭 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-8 mb-4">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`text-[32px] font-bold leading-[44.8px] ${
                  activeTab === 'analytics' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                학습분석
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`text-[32px] font-bold leading-[44.8px] ${
                  activeTab === 'account' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                계정관리
              </button>
            </div>
            <p className="text-[20px] leading-[28px] text-gray-600">
              학습 현황을 확인하고 계정을 관리하세요
            </p>
          </div>

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl p-8 border border-gray-300">
            <p className="text-gray-600 text-center py-20">
              학습분석 기능은 준비 중입니다.
            </p>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl p-8 border border-gray-300">
            <h2 className="text-[20px] font-medium leading-[28px] mb-8 text-gray-900">
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
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-[110px] h-[110px] rounded-full border-2 border-primary flex items-center justify-center bg-gray-100 overflow-hidden">
                      {previewImageUrl ? (
                        // 미리보기 이미지 표시
                        <img
                          src={previewImageUrl}
                          alt="프로필 미리보기"
                          className="w-[100px] h-[100px] rounded-full object-cover"
                        />
                      ) : profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="프로필"
                          className="w-[100px] h-[100px] rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src="/icon/default.svg"
                          alt="기본 프로필"
                          className="w-[100px] h-[100px] rounded-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={handleProfileImageClick}
                      disabled={isSaving}
                      className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="프로필 이미지 변경"
                    >
                      <img
                        src="/icon/icn_write.svg"
                        alt="프로필 이미지 변경"
                        className="w-4 h-4"
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
            <div className="mb-6 flex flex-col items-center">
              <div className="max-w-[350px] w-full">
                <Input
                  label="닉네임"
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
                  className="w-full"
                  error={saveError || undefined}
                />
                <p className="mt-2 text-[14px] text-gray-600 text-left">
                  닉네임은 6자까지만 가능합니다.
                </p>
              </div>
            </div>

            {/* 이메일 입력 (비활성화) */}
            <div className="mb-8 flex flex-col items-center">
              <div className="max-w-[350px] w-full">
                <Input
                  label="이메일"
                  value={email}
                  disabled
                  className="w-full"
                />
                <p className="mt-2 text-[14px] text-red-500 text-left">
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

