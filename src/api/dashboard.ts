import { authenticatedFetch } from './account';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 오늘의 학습 요약
 */
export type TodaySummary = {
  solvedCount: number;
  correctCount: number;
  wrongCount: number;
};

/**
 * 누적 통계 요약
 */
export type CumulativeSummary = {
  solvedCount: number;
  correctCount: number;
  wrongCount: number;
};

/**
 * 문제 유형별 통계
 */
export type QuizTypeSummary = {
  quizType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  solvedCount: number;
  correctCount: number;
  wrongCount: number;
};

/**
 * 주제별 통계
 */
export type TopicSummary = {
  topic: string;
  solvedCount: number;
  correctCount: number;
  wrongCount: number;
};

/**
 * 일별 통계
 */
export type DailySummary = {
  date: string;
  solvedCount: number;
};

/**
 * 시간대별 통계
 */
export type HourlySummary = {
  startHour: number;
  solvedCount: number;
};

/**
 * 대시보드 통계 응답 타입
 */
export type DashboardResponse = {
  todaySummary: TodaySummary;
  cumulativeSummary: CumulativeSummary;
  quizTypeSummaryList: QuizTypeSummary[];
  topicSummaryList: TopicSummary[];
  dailySummaryList: DailySummary[];
  hourlySummaryList: HourlySummary[];
};

/**
 * 대시보드 통계 조회 API
 */
export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/account/dashboard`, {
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
        `대시보드 통계 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};
