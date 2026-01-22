const ACCESS_TOKEN_KEY = 'accessToken';
const TEMP_ACCESS_TOKEN_KEY = 'tempAccessToken'; // 온보딩 완료 전 임시 저장용
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

  // 임시 토큰 저장 (온보딩 완료 전)
  setTempAccessToken: (token: string): void => {
    sessionStorage.setItem(TEMP_ACCESS_TOKEN_KEY, token);
  },

  // 임시 토큰 조회
  getTempAccessToken: (): string | null => {
    return sessionStorage.getItem(TEMP_ACCESS_TOKEN_KEY);
  },

  // 임시 토큰 제거
  removeTempAccessToken: (): void => {
    sessionStorage.removeItem(TEMP_ACCESS_TOKEN_KEY);
  },

  // 임시 토큰을 정식 토큰으로 전환 (온보딩 완료 시)
  activateTempToken: (): void => {
    const tempToken = authUtils.getTempAccessToken();
    if (tempToken) {
      authUtils.setAccessToken(tempToken);
      authUtils.removeTempAccessToken();
    }
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getAccessToken();
  },

  logout: (): void => {
    authUtils.removeAccessToken();
    authUtils.removeTempAccessToken();
    // 로그아웃 시 최근 로그인 정보는 유지 (선택사항)
  },

  /**
   * 모든 토큰 제거 (로그아웃 시 사용)
   * Refresh Token은 HttpOnly 쿠키에 있으므로 서버에서 처리되어야 하지만,
   * 클라이언트 측에서도 Access Token은 제거
   */
  removeAllTokens: (): void => {
    authUtils.removeAccessToken();
    authUtils.removeTempAccessToken();
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
