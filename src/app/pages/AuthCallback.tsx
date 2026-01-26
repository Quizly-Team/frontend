import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { authUtils } from '@/lib/auth';
import { OAUTH_ENDPOINTS, type AuthResponse } from '@/api/auth';
import { getUserInfo } from '@/api/account';

const VALID_PROVIDERS = ['naver', 'kakao'] as const;

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const hasProcessed = useRef(false);
  const [showLoading, setShowLoading] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const handleCallback = async () => {
      const startTime = Date.now();
      
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          throw new Error('Missing code or state parameter');
        }

        if (!provider || !VALID_PROVIDERS.includes(provider as typeof VALID_PROVIDERS[number])) {
          throw new Error('Invalid provider');
        }

        const backendUrl = `${OAUTH_ENDPOINTS.CALLBACK}/${provider}?code=${code}&state=${state}`;

        const response = await fetch(backendUrl, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`OAuth callback failed: ${response.status}`);
        }

        const data: AuthResponse = await response.json();

        // 최근 로그인 provider 저장
        if (provider === 'naver' || provider === 'kakao') {
          authUtils.setLastLoginProvider(provider);
        }

        // 사용자 정보 조회하여 온보딩 완료 여부 확인
        try {
          // 임시 토큰으로 사용자 정보 조회 시도
          authUtils.setTempAccessToken(data.accessToken);
          
          const userInfo = await getUserInfo();
          if (!userInfo.onboardingCompleted) {
            // 온보딩 미완료 시 임시 토큰만 저장하고 온보딩 화면으로 이동
            // (정식 토큰은 저장하지 않아서 로그인 상태가 아님)
            setShowLoading(false);
            navigate('/onboarding', { replace: true });
          } else {
            // 온보딩 완료 시 정식 토큰 저장 및 로그인 완료 처리
            authUtils.setAccessToken(data.accessToken);
            authUtils.removeTempAccessToken();
            
            // UserContext에 인증 상태 변경 알림
            window.dispatchEvent(new Event('authStateChanged'));
            
            // 로딩 화면을 최소 1초간 보여주고 홈으로 이동
            setShowLoading(true);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1000 - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            navigate('/', { replace: true });
          }
        } catch (error) {
          // 조회 실패 시 임시 토큰 제거하고 로그인 페이지로 이동
          authUtils.removeTempAccessToken();
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        alert(`로그인에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, provider]);

  // 초기 상태이거나 온보딩 미완료 시 로딩 화면을 렌더링하지 않음
  if (showLoading === false) {
    return null;
  }

  // 온보딩 완료 시에만 로딩 화면 표시
  if (showLoading === true) {
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

  // 초기 상태 (null)일 때는 아무것도 렌더링하지 않음
  return null;
};

AuthCallback.displayName = 'AuthCallback';

export default AuthCallback;
