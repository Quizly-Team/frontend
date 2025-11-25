import { authUtils } from '@/lib/auth';
import { OAUTH_ENDPOINTS, type TokenReissueResponse } from './auth';
import type {
  QuizResponse,
  SubmitAnswerResponse,
  QuizGroupResponse,
  WrongQuizGroupResponse,
  UpdateQuizzesTopicRequest,
  UpdateQuizzesTopicResponse,
} from '@/types/quiz';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

type CreateQuizTextRequest = {
  plainText: string;
  type: QuizType;
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
 * 인증이 필요한 API 요청을 위한 공통 fetch 함수
 * 401 에러 시 자동으로 토큰 재발급 및 재시도
 */
const authenticatedFetch = async (
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
 * 텍스트 입력으로 문제 생성 (회원)
 */
export const createQuizByTextMember = async (
  request: CreateQuizTextRequest
): Promise<QuizResponse> => {
  console.log('[회원] 문제 생성 요청:', {
    url: `${API_BASE_URL}/quizzes/member`,
    body: request,
  });

  const response = await authenticatedFetch(`${API_BASE_URL}/quizzes/member`, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  console.log('[회원] 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[회원] 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `문제 생성 실패: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log('[회원] 성공 응답:', data);
  return data;
};

/**
 * 텍스트 입력으로 문제 생성 (비회원)
 */
export const createQuizByTextGuest = async (
  request: CreateQuizTextRequest
): Promise<QuizResponse> => {
  console.log('[비회원] 문제 생성 요청:', {
    url: `${API_BASE_URL}/quizzes/guest`,
    body: request,
  });

  const response = await fetch(`${API_BASE_URL}/quizzes/guest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  console.log('[비회원] 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[비회원] 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `문제 생성 실패: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log('[비회원] 성공 응답:', data);
  return data;
};

/**
 * 파일(OCR) 입력으로 문제 생성 (회원)
 */
export const createQuizByFileMember = async (
  file: File,
  type: QuizType
): Promise<QuizResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authenticatedFetch(
    `${API_BASE_URL}/quizzes/member/ocr?type=${type}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `문제 생성 실패: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * 파일(OCR) 입력으로 문제 생성 (비회원)
 */
export const createQuizByFileGuest = async (
  file: File,
  type: QuizType
): Promise<QuizResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  console.log('[비회원 파일] 문제 생성 요청:', {
    url: `${API_BASE_URL}/quizzes/guest/ocr?type=${type}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  const response = await fetch(
    `${API_BASE_URL}/quizzes/guest/ocr?type=${type}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  console.log('[비회원 파일] 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[비회원 파일] 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `문제 생성 실패: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log('[비회원 파일] 성공 응답:', data);
  return data;
};

/**
 * 통합 문제 생성 함수
 * - 로그인 상태와 입력 타입(텍스트/파일)에 따라 자동으로 적절한 API 호출
 */
export const createQuiz = async (
  content: string | File,
  type: QuizType,
  isLoggedIn: boolean
): Promise<QuizResponse> => {
  // 파일인 경우
  if (content instanceof File) {
    return isLoggedIn
      ? createQuizByFileMember(content, type)
      : createQuizByFileGuest(content, type);
  }

  // 텍스트인 경우
  const request: CreateQuizTextRequest = {
    plainText: content,
    type,
  };

  return isLoggedIn
    ? createQuizByTextMember(request)
    : createQuizByTextGuest(request);
};

/**
 * 답안 제출 (회원)
 * @param quizId - 문제 ID
 * @param userAnswer - 사용자가 선택한 답안
 */
export const submitAnswerMember = async (
  quizId: number,
  userAnswer: string
): Promise<SubmitAnswerResponse> => {
  console.log('[회원] 답안 제출 요청:', {
    url: `${API_BASE_URL}/quizzes/${quizId}/answer/member`,
    body: { userAnswer },
  });

  const response = await authenticatedFetch(
    `${API_BASE_URL}/quizzes/${quizId}/answer/member`,
    {
      method: 'POST',
      body: JSON.stringify({ userAnswer }),
    }
  );

  console.log('[회원] 답안 제출 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[회원] 답안 제출 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `답안 제출 실패: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log('[회원] 답안 제출 성공 응답:', data);
  return data;
};

/**
 * 문제 모아보기 조회 (회원)
 * @param groupType - 그룹화 기준 (예: 'date')
 */
export const getQuizGroups = async (groupType: string = 'date'): Promise<QuizGroupResponse> => {
  console.log('[회원] 문제 모아보기 조회 요청:', {
    url: `${API_BASE_URL}/quizzes?groupType=${groupType}`,
  });

  const response = await authenticatedFetch(
    `${API_BASE_URL}/quizzes?groupType=${groupType}`,
    {
      method: 'GET',
    }
  );

  console.log('[회원] 문제 모아보기 조회 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[회원] 문제 모아보기 조회 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `문제 모아보기 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log('[회원] 문제 모아보기 조회 성공 응답:', data);
  return data;
};

/**
 * 틀린 문제 조회 (회원)
 * @param groupType - 그룹화 기준 (date | topic)
 */
export const getWrongQuizzes = async (
  groupType: 'date' | 'topic' = 'date'
): Promise<WrongQuizGroupResponse> => {
  console.log('[회원] 틀린 문제 조회 요청:', {
    url: `${API_BASE_URL}/quizzes/wrong?groupType=${groupType}`,
    groupType,
  });

  const response = await authenticatedFetch(
    `${API_BASE_URL}/quizzes/wrong?groupType=${groupType}`,
    {
      method: 'GET',
    }
  );

  console.log('[회원] 틀린 문제 조회 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[회원] 틀린 문제 조회 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message ||
        `틀린 문제 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const updateQuizzesTopic = async (
  request: UpdateQuizzesTopicRequest
): Promise<UpdateQuizzesTopicResponse> => {
  console.log('[회원] 틀린 문제 주제 수정 요청:', {
    url: `${API_BASE_URL}/quizzes/topic`,
    quizCount: request.quizIdList.length,
  });

  const response = await authenticatedFetch(`${API_BASE_URL}/quizzes/topic`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[회원] 틀린 문제 주제 수정 에러 응답:', errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message ||
        `주제 수정에 실패했어요: ${response.status} ${response.statusText}`
    );
  }

  const rawText = await response.text();
  if (!rawText) {
    return { success: true };
  }

  try {
    return JSON.parse(rawText) as UpdateQuizzesTopicResponse;
  } catch {
    return { success: true };
  }
};
