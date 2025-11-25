const ACCESS_TOKEN_KEY = 'accessToken';

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
  },

  /**
   * 모든 토큰 제거 (로그아웃 시 사용)
   * Refresh Token은 HttpOnly 쿠키에 있으므로 서버에서 처리되어야 하지만,
   * 클라이언트 측에서도 Access Token은 제거
   */
  removeAllTokens: (): void => {
    authUtils.removeAccessToken();
  },
};
