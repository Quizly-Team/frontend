import { authUtils } from '@/lib/auth';
import { OAUTH_ENDPOINTS, type TokenReissueResponse } from './auth';
import type { TodaySummary } from './dashboard';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
 * 인증이 필요한 API 요청을 위한 공통 fetch 함수
 * 401 에러 시 자동으로 토큰 재발급 및 재시도
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = authUtils.getAccessToken();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  // 초기 요청 헤더 설정
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  // FormData가 아닌 경우 Content-Type 설정
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  // 초기 요청 실행
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // HttpOnly 쿠키를 포함하여 요청
  });

  // 401 에러인 경우 토큰 재발급 시도
  if (response.status === 401) {
    try {
      // 토큰 재발급
      const newAccessToken = await handleTokenRefresh();

      // 새 토큰으로 원래 요청 재시도
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

      // FormData인 경우 Content-Type 제거 (브라우저가 자동으로 boundary 설정)
      if (options.body instanceof FormData && retryHeaders.has('Content-Type')) {
        retryHeaders.delete('Content-Type');
      } else if (!(options.body instanceof FormData) && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });

      if (!retryResponse.ok) {
        // 재시도 후에도 401/403이면 로그아웃 처리
        if (retryResponse.status === 401 || retryResponse.status === 403) {
          authUtils.removeAllTokens();
          window.location.href = '/';
        }
      }

      return retryResponse;
    } catch (refreshError) {
      // 토큰 재발급 실패 시 이미 handleTokenRefresh에서 로그아웃 처리됨
      throw refreshError;
    }
  }

  return response;
};

/**
 * 유저 정보 조회 응답 타입
 */
export type ReadUserInfoResponse = {
  name: string;
  nickName: string;
  email: string;
  profileImageUrl: string | null;
  onboardingCompleted: boolean;
};

/**
 * 유저 정보 조회 API
 */
export const getUserInfo = async (): Promise<ReadUserInfoResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/account`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `유저 정보 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * 닉네임 변경 요청 타입
 */
export type UpdateUserNickNameRequest = {
  nickName: string;
};

/**
 * 닉네임 변경 응답 타입
 */
export type UpdateUserNickNameResponse = {};

/**
 * 닉네임 변경 API
 */
export const updateNickname = async (
  request: UpdateUserNickNameRequest
): Promise<UpdateUserNickNameResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/account/nickname`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `닉네임 변경 실패: ${response.status} ${response.statusText}`
    );
  }

  // 응답이 비어있을 수 있으므로 빈 객체 반환
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

/**
 * 프로필 이미지 변경 응답 타입
 */
export type UpdateUserProfileImageResponse = {
  profileImageUrl?: string;
};

/**
 * 프로필 이미지 변경 API
 */
export const updateProfileImage = async (
  file: File
): Promise<UpdateUserProfileImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authenticatedFetch(`${API_BASE_URL}/account/profileImage`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message ||
        `프로필 이미지 변경 실패: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * 로그아웃 API
 */
export const logout = async (): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `로그아웃 실패: ${response.status} ${response.statusText}`
    );
  }

  // 로그아웃 성공 시 클라이언트 측 토큰도 제거
  authUtils.removeAllTokens();
};

/**
 * 오늘의 학습 요약 조회 API
 */
export const getTodaySummary = async (): Promise<{ todaySummary: TodaySummary }> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/account/today-summary`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message ||
        `오늘의 학습 요약 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * 온보딩 정보 저장 요청 타입
 */
export type SaveOnboardingRequest = {
  targetType: string;
  studyGoal: string;
};

/**
 * 온보딩 정보 저장 응답 타입
 */
export type SaveOnboardingResponse = {};

/**
 * 온보딩 정보 저장 API
 */
export const saveOnboarding = async (
  request: SaveOnboardingRequest
): Promise<SaveOnboardingResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/account/onboarding`, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `온보딩 정보 저장 실패: ${response.status} ${response.statusText}`
    );
  }

  // 응답이 비어있을 수 있으므로 빈 객체 반환
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};
