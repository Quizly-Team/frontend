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
};
