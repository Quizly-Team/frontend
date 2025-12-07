const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const OAUTH_ENDPOINTS = {
  NAVER: `${AUTH_BASE_URL}/oauth2/authorization/naver`,
  KAKAO: `${AUTH_BASE_URL}/oauth2/authorization/kakao`,
  CALLBACK: `${AUTH_BASE_URL}/login/oauth2/code`,
  REISSUE: `${AUTH_BASE_URL}/auth/reissue`,
} as const;

export type OAuthProvider = 'naver' | 'kakao';

export type AuthResponse = {
  accessToken: string;
};

export type TokenReissueResponse = {
  accessToken: string;
};
