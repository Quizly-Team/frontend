// 백엔드 스펙 확정 전 잠정 shape. 확정 시 src/types/quiz.ts의 API 계약 타입으로 이관한다.
// 이 파일의 타입은 서버 응답을 단정하지 않으며, 현재는 mock 전용이다. (#116)

export type DailyQuizChoice = 'O' | 'X'

/** 문단 텍스트의 한 구간. accent가 있으면 해당 의미색으로 강조한다 */
export type DailyQuizTextSpan = {
  text: string
  accent?: 'primary' | 'info' | 'error'
}

/** AI가 읽은 원본 자료 — 파일명 + 본문 전문 + 세트 단위 태그 */
export type DailyQuizSource = {
  title: string
  subtitle: string
  fileName: string
  body: DailyQuizTextSpan[]
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
  description: DailyQuizTextSpan[]
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
