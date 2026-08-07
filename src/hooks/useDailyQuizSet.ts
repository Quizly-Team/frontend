import { useQuery } from '@tanstack/react-query'
import { getDailyQuizSet } from '@/api/dailyQuiz'
import type { DailyQuizSet } from '@/types/dailyQuiz'

export const useDailyQuizSet = () =>
  useQuery<DailyQuizSet | null>({
    queryKey: ['daily-quiz', 'set'],
    queryFn: getDailyQuizSet,
    // 엔드포인트가 발행된 세트 중 하나를 임의로 돌려주므로, 재조회가 풀이 도중 세트를 갈아치울 수 있다.
    // 전역 공유·읽기 전용 콘텐츠라 세션 동안 고정한다.
    staleTime: Infinity,
  })
