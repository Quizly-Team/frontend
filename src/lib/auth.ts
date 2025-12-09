const ACCESS_TOKEN_KEY = 'accessToken';
const LAST_LOGIN_PROVIDER_KEY = 'lastLoginProvider';

export const authUtils = {
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  removeAccessToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getAccessToken();
  },

  logout: (): void => {
    authUtils.removeAccessToken();
    // 로그아웃 시 최근 로그인 정보는 유지 (선택사항)
  },

  /**
   * 모든 토큰 제거 (로그아웃 시 사용)
   * Refresh Token은 HttpOnly 쿠키에 있으므로 서버에서 처리되어야 하지만,
   * 클라이언트 측에서도 Access Token은 제거
   */
  removeAllTokens: (): void => {
    authUtils.removeAccessToken();
  },

  // 최근 로그인 provider 저장
  setLastLoginProvider: (provider: 'naver' | 'kakao'): void => {
    localStorage.setItem(LAST_LOGIN_PROVIDER_KEY, provider);
  },

  // 최근 로그인 provider 조회
  getLastLoginProvider: (): 'naver' | 'kakao' | null => {
    const provider = localStorage.getItem(LAST_LOGIN_PROVIDER_KEY);
    if (provider === 'naver' || provider === 'kakao') {
      return provider;
    }
    return null;
  },
};
