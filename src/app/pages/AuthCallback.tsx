import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { authUtils } from '@/lib/auth';
import { OAUTH_ENDPOINTS, type AuthResponse } from '@/api/auth';

const VALID_PROVIDERS = ['naver', 'kakao'] as const;

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const handleCallback = async () => {
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

        authUtils.setAccessToken(data.accessToken);
        
        // 최근 로그인 provider 저장
        if (provider === 'naver' || provider === 'kakao') {
          authUtils.setLastLoginProvider(provider);
        }

        // UserContext에 인증 상태 변경 알림
        window.dispatchEvent(new Event('authStateChanged'));

        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        alert(`로그인에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, provider]);

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
};

AuthCallback.displayName = 'AuthCallback';

export default AuthCallback;
