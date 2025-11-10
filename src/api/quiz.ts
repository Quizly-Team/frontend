import { authUtils } from '@/lib/auth';
import type { QuizResponse, SubmitAnswerRequest, SubmitAnswerResponse } from '@/types/quiz';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

type CreateQuizTextRequest = {
  plainText: string;
  type: QuizType;
};

/**
 * 텍스트 입력으로 문제 생성 (회원)
 */
export const createQuizByTextMember = async (
  request: CreateQuizTextRequest
): Promise<QuizResponse> => {
  const token = authUtils.getAccessToken();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  console.log('[회원] 문제 생성 요청:', {
    url: `${API_BASE_URL}/quizzes/member`,
    body: request,
    hasToken: !!token,
  });

  const response = await fetch(`${API_BASE_URL}/quizzes/member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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
  const token = authUtils.getAccessToken();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/quizzes/member/ocr?type=${type}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  const token = authUtils.getAccessToken();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  console.log('[회원] 답안 제출 요청:', {
    url: `${API_BASE_URL}/quizzes/${quizId}/answer/member`,
    body: { userAnswer },
    hasToken: !!token,
  });

  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/answer/member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userAnswer }),
  });

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
