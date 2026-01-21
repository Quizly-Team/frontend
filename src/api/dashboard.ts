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
  aiAnalysisResult?: string;
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

  const data = await response.json();
  
  // 데이터가 유효한지 확인
  if (!data || typeof data !== 'object') {
    console.error('Invalid dashboard response:', data);
    throw new Error('대시보드 응답 데이터가 유효하지 않습니다.');
  }
  
  // aiAnalysis 객체에서 aiAnalysisResult 추출
  if (data.aiAnalysis && typeof data.aiAnalysis === 'object') {
    if (data.aiAnalysis.aiAnalysisResult) {
      data.aiAnalysisResult = data.aiAnalysis.aiAnalysisResult;
    } else if (data.aiAnalysis.ai_analysis_result) {
      data.aiAnalysisResult = data.aiAnalysis.ai_analysis_result;
    }
  }
  
  // 여러 가능한 필드명 체크 (camelCase, snake_case, kebab-case 등)
  const aiAnalysisKeys = [
    'aiAnalysisResult',
    'ai_analysis_result',
    'aiAnalysis',
    'ai_analysis',
    'analysisResult',
    'analysis_result'
  ];
  
  // 첫 번째로 찾은 AI 분석 결과를 aiAnalysisResult로 매핑
  if (!data.aiAnalysisResult) {
    for (const key of aiAnalysisKeys) {
      if (data[key] !== undefined && data[key] !== null) {
        try {
          // 문자열인 경우만 사용
          const value = data[key];
          if (typeof value === 'string') {
            data.aiAnalysisResult = value;
            break;
          } else if (value && typeof value === 'object' && value.aiAnalysisResult) {
            // 중첩된 객체인 경우
            data.aiAnalysisResult = value.aiAnalysisResult;
            break;
          }
        } catch (err) {
          console.warn(`Failed to process AI analysis key ${key}:`, err);
        }
      }
    }
  }
  
  // aiAnalysisResult가 문자열이 아닌 경우 문자열로 변환 (반드시 문자열로 보장)
  if (data.aiAnalysisResult !== undefined && data.aiAnalysisResult !== null) {
    try {
      if (typeof data.aiAnalysisResult !== 'string') {
        data.aiAnalysisResult = String(data.aiAnalysisResult);
      }
      // 빈 문자열 체크
      if (data.aiAnalysisResult.trim() === '') {
        data.aiAnalysisResult = undefined;
      }
    } catch (err) {
      console.warn('Failed to convert aiAnalysisResult to string:', err);
      data.aiAnalysisResult = undefined;
    }
  }
  
  return data;
};
