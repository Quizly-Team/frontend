import { OAUTH_ENDPOINTS, type OAuthProvider } from '@/api/auth';

export const oauthLogin = (provider: OAuthProvider): void => {
  const authUrl =
    provider === 'naver' ? OAUTH_ENDPOINTS.NAVER : OAUTH_ENDPOINTS.KAKAO;

  window.location.href = authUrl;
};
