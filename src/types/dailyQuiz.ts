// 화면이 쓰는 세트 형상(view model). 서버 응답 원형은 src/api/dailyQuiz.ts에 있고,
// 서버 데이터와 화면 고정 카피는 normalizeDailyQuizSet 한 곳에서만 합류한다. (#116)
// 규칙: 서버가 주는 텍스트는 평문 string, 화면 고정 카피만 DailyQuizTextSpan[]이다.

export type DailyQuizChoice = 'O' | 'X'

/** 화면 고정 카피 문단의 한 구간. accent가 있으면 해당 의미색으로 강조한다 */
export type DailyQuizTextSpan = {
  text: string
  accent?: 'primary' | 'info' | 'error'
}

/** AI가 읽은 원본 자료 — 자료 라벨 + 본문 전문 + 세트 단위 태그 */
export type DailyQuizSource = {
  title: string
  subtitle: string
  /** 창 헤더에 표시할 자료 라벨. 서버는 파일명을 주지 않아 topic이 들어온다 */
  label?: string
  body: string
  tags: string[]
  notice: string
}

export type DailyQuizQuestion = {
  id: number
  text: string
  options: readonly [DailyQuizChoice, DailyQuizChoice]
  answer: DailyQuizChoice
  explanation: string
}

export type DailyQuizIntro = {
  /** 정적 라벨. 카운트다운·타이머가 아니다 */
  badges: string[]
  headline: string
  subheadline: string
  /** 서버 warmUp 원문 */
  description: string
  startLabel: string
}

export type DailyQuizResultCopy = {
  headline: DailyQuizTextSpan[]
  description: DailyQuizTextSpan[]
  ctaLabel: string
}

export type DailyQuizSet = {
  title: string
  intro: DailyQuizIntro
  source: DailyQuizSource
  questions: DailyQuizQuestion[]
  result: DailyQuizResultCopy
}
