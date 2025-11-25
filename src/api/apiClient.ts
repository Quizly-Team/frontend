import { authUtils } from '@/lib/auth';
import { OAUTH_ENDPOINTS, type TokenReissueResponse } from './auth';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * API 요청 시 사용할 설정 타입
 */
type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean; // 인증이 필요한 요청인지 여부
};

/**
 * 재발급 중인지 추적하는 플래그 (동시 재발급 방지)
 */
let isRefreshing = false;
/**
 * 재발급 대기 중인 요청들을 저장하는 큐
 */
const refreshSubscribers: Array<{
  resolve: (accessToken: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * 재발급 대기 중인 모든 요청에 새 토큰을 전달
 */
const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(accessToken));
  refreshSubscribers.length = 0;
};

/**
 * 재발급 실패 시 모든 대기 중인 요청을 실패 처리
 */
const onRefreshFailed = (error: Error) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers.length = 0;
};

/**
 * 토큰 재발급 API 호출
 * Refresh Token은 HttpOnly 쿠키에 저장되어 있어 자동으로 전송됨
 */
const reissueTokens = async (): Promise<TokenReissueResponse> => {
  const response = await fetch(OAUTH_ENDPOINTS.REISSUE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // HttpOnly 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    // 재발급 실패 시 토큰 삭제 및 로그인 페이지로 리다이렉트
    authUtils.removeAllTokens();
    window.location.href = '/';

    throw new Error(
      errorData.message || `토큰 재발급 실패: ${response.status} ${response.statusText}`
    );
  }

  const data: TokenReissueResponse = await response.json();
  return data;
};

/**
 * 토큰 재발급 처리 (동시 요청 방지)
 */
const handleTokenRefresh = async (): Promise<string> => {
  // 이미 재발급 중이면 대기
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshSubscribers.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const { accessToken } = await reissueTokens();

    // 새 accessToken을 localStorage에 저장
    authUtils.setAccessToken(accessToken);

    // 대기 중인 모든 요청에 새 토큰 전달
    onRefreshed(accessToken);

    return accessToken;
  } catch (error) {
    // 재발급 실패 시 모든 대기 중인 요청 실패 처리
    onRefreshFailed(error as Error);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * 에러 메시지에서 '액세스 토큰 만료' 여부 확인
 */
const isAccessTokenExpiredError = (errorText: string): boolean => {
  return errorText.includes('액세스 토큰 만료') || 
         errorText.includes('ACCESS_TOKEN_EXPIRED') ||
         errorText.toLowerCase().includes('access token expired');
};

/**
 * 통합 API 클라이언트
 * - 모든 요청에 자동으로 Authorization 헤더 추가
 * - 401 에러 시 자동으로 토큰 재발급 및 요청 재시도
 * - Refresh Token Rotation 지원
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * API 요청 실행 (토큰 재발급 및 재시도 로직 포함)
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, requiresAuth = true } = config;

    // 인증이 필요한 요청인 경우 accessToken 추가
    let accessToken: string | null = null;
    if (requiresAuth) {
      accessToken = authUtils.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    // Content-Type 설정 (FormData인 경우 제외 - 브라우저가 자동으로 boundary 설정)
    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    // 요청 실행 (쿠키를 포함하여 요청)
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      credentials: 'include', // HttpOnly 쿠키를 포함하여 요청
    });

    // 401 에러이고 '액세스 토큰 만료' 에러인 경우 토큰 재발급 시도
    if (response.status === 401 && requiresAuth) {
      const errorText = await response.text();
      
      if (isAccessTokenExpiredError(errorText)) {
        try {
          // 토큰 재발급
          const newAccessToken = await handleTokenRefresh();

          // 새 토큰으로 원래 요청 재시도
          const retryHeaders = { ...headers };
          retryHeaders['Authorization'] = `Bearer ${newAccessToken}`;
          
          // FormData인 경우 Content-Type 제거 (브라우저가 자동으로 boundary 설정)
          if (isFormData && 'Content-Type' in retryHeaders) {
            delete retryHeaders['Content-Type'];
          }

          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            method,
            headers: retryHeaders,
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            credentials: 'include', // HttpOnly 쿠키를 포함하여 요청
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            let retryErrorData;
            try {
              retryErrorData = JSON.parse(retryErrorText);
            } catch {
              retryErrorData = { message: retryErrorText };
            }

            // 재시도 후에도 401/403이면 로그아웃 처리
            if (retryResponse.status === 401 || retryResponse.status === 403) {
              authUtils.removeAllTokens();
              window.location.href = '/';
            }

            throw new Error(
              retryErrorData.message || 
              `API 요청 실패: ${retryResponse.status} ${retryResponse.statusText}`
            );
          }

          const retryData = await retryResponse.json();
          return retryData;
        } catch (refreshError) {
          // 토큰 재발급 실패 시 이미 handleTokenRefresh에서 로그아웃 처리됨
          throw refreshError;
        }
      } else {
        // '액세스 토큰 만료'가 아닌 다른 401 에러
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        // REFRESH_TOKEN_INVALID 등의 에러인 경우 로그아웃
        if (
          errorText.includes('REFRESH_TOKEN_INVALID') ||
          errorText.includes('리프레시 토큰') ||
          errorText.toLowerCase().includes('refresh token')
        ) {
          authUtils.removeAllTokens();
          window.location.href = '/';
        }

        throw new Error(
          errorData.message || `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }
    }

    // 일반적인 에러 처리
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(
        errorData.message || `API 요청 실패: ${response.status} ${response.statusText}`
      );
    }

    // 빈 응답 처리
    const rawText = await response.text();
    if (!rawText) {
      return {} as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch {
      return rawText as T;
    }
  }

  /**
   * GET 요청
   */
  async get<T>(
    endpoint: string,
    options?: { requiresAuth?: boolean; headers?: Record<string, string> }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: options?.headers,
      requiresAuth: options?.requiresAuth ?? true,
    });
  }

  /**
   * POST 요청
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: { requiresAuth?: boolean; headers?: Record<string, string> }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers: options?.headers,
      requiresAuth: options?.requiresAuth ?? true,
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: { requiresAuth?: boolean; headers?: Record<string, string> }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      headers: options?.headers,
      requiresAuth: options?.requiresAuth ?? true,
    });
  }

  /**
   * PATCH 요청
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: { requiresAuth?: boolean; headers?: Record<string, string> }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
      headers: options?.headers,
      requiresAuth: options?.requiresAuth ?? true,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(
    endpoint: string,
    options?: { requiresAuth?: boolean; headers?: Record<string, string> }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: options?.headers,
      requiresAuth: options?.requiresAuth ?? true,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

