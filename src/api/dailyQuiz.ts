import { mockDailyQuizResponse } from '@/mocks/dailyQuizData'
import type {
  DailyQuizChoice,
  DailyQuizQuestion,
  DailyQuizSet,
} from '@/types/dailyQuiz'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 백엔드 없이 화면을 돌릴 때 켠다. 문자열 'true'일 때만 활성 — 미설정·오타는 실서버로 붙는다. (#116)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 발행된 세트가 없을 때 서버가 내려주는 코드. 예외가 아니라 '빈 상태'다. (#116)
const NOT_FOUND_PUBLISHED_ERROR_CODE = 'NOT_FOUND_PUBLISHED_DAILY_QUIZ'

export type DailyQuizAnswerCode = 'TRUE' | 'FALSE'

export type DailyQuizQuestionResponse = {
  questionId: number
  questionNumber: number
  questionText: string
  answer: DailyQuizAnswerCode
  explanation: string
  hashtags: string[]
}

export type DailyQuizSetResponse = {
  success: boolean
  errorCode: string | null
  dailyQuizId: number
  topic: string
  warmUp: string
  sourceContent: string
  questions: DailyQuizQuestionResponse[]
}

/**
 * 서버가 주지 않는 화면 고정 카피.
 * 서버 필드(warmUp·sourceContent·topic·questions·hashtags)와 여기의 카피는
 * normalizeDailyQuizSet 한 곳에서만 합류한다.
 */
const DAILY_QUIZ_COPY = {
  intro: {
    badges: ['Daily', '5min'],
    headline: '5분 상식 퀴즈',
    subheadline: 'AI가 출제하는 오늘의 상식 문제',
    startLabel: '오늘의 퀴즈 시작하기',
  },
  source: {
    title: 'AI가 읽은 원본 자료',
    subtitle: 'AI가 출제하는 오늘의 상식 문제',
    notice:
      'Quizly AI가 위 원본 자료의 핵심 맥락을 분석하여 정교한 OX 퀴즈를 추출했습니다. 문제를 풀어보세요!',
  },
  result: {
    headline: [
      { text: '긴 텍스트 정리하기 귀찮을 땐,\n이제 ' },
      { text: '퀴즐리', accent: 'primary' as const },
      { text: '에게 맡기세요!' },
    ],
    description: [
      {
        text: '오늘 푼 상식 퀴즈처럼, 전공 서적이나 시사 잡지를 퀴즐리에 넣어보세요.\n사진만 찍어 올려도 ',
      },
      {
        text: 'AI가 즉시 정교한 시험 문제를 만들어 줍니다.',
        accent: 'primary' as const,
      },
    ],
    ctaLabel: '3초만에 소셜미디어 가입하기',
  },
}

// 서버는 'TRUE'/'FALSE' 문자열, 화면은 'O'/'X'를 쓴다.
const toChoice = (answer: DailyQuizAnswerCode): DailyQuizChoice =>
  answer === 'TRUE' ? 'O' : 'X'

// hashtags는 '#온실효과' 형태로 온다. 화면이 '#'을 붙여 렌더하므로 여기서 떼어낸다.
const toTag = (hashtag: string): string => hashtag.replace(/^#+/, '').trim()

/**
 * 서버 응답 → 화면이 쓰는 세트 형상. 서버 shape 변동을 흡수하는 유일한 지점이다.
 * 문항 순서는 questionNumber로 다시 정렬한다(서버 순서에 기대지 않는다).
 * 태그는 문항별 hashtags의 합집합 — Figma의 태그행은 세트 단위 1줄이다.
 */
export const normalizeDailyQuizSet = (
  response: DailyQuizSetResponse,
): DailyQuizSet => {
  const questions = [...response.questions].sort(
    (a, b) => a.questionNumber - b.questionNumber,
  )

  const tags = [
    ...new Set(
      questions
        .flatMap((question) => question.hashtags.map(toTag))
        .filter(Boolean),
    ),
  ]

  return {
    title: `오늘의 OX 퀴즈 (${questions.length}문제)`,
    intro: {
      ...DAILY_QUIZ_COPY.intro,
      description: response.warmUp,
    },
    source: {
      ...DAILY_QUIZ_COPY.source,
      label: response.topic,
      body: response.sourceContent,
      tags,
    },
    questions: questions.map<DailyQuizQuestion>((question) => ({
      id: question.questionId,
      text: question.questionText,
      options: ['O', 'X'],
      answer: toChoice(question.answer),
      explanation: question.explanation,
    })),
    result: DAILY_QUIZ_COPY.result,
  }
}

/**
 * GET /daily-quizzes — 인증 불필요(게스트도 200). 그래서 인증 fetch 래퍼를 타지 않는다.
 * (인증 래퍼는 토큰이 없으면 요청 전에 throw하므로 게스트 경로가 통째로 깨진다.)
 * 발행된 세트가 없으면 null을 반환한다(빈 상태이지 오류가 아니다).
 */
export const getDailyQuizSet = async (): Promise<DailyQuizSet | null> => {
  // mock도 서버 원본 응답 형상이므로 실서버와 동일하게 normalizeDailyQuizSet을 통과한다.
  if (USE_MOCK) return normalizeDailyQuizSet(mockDailyQuizResponse)

  const response = await fetch(`${API_BASE_URL}/daily-quizzes`, {
    method: 'GET',
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }

    if (
      response.status === 404 ||
      errorData.errorCode === NOT_FOUND_PUBLISHED_ERROR_CODE
    ) {
      return null
    }

    throw new Error(
      errorData.message ||
        `상식 퀴즈 조회 실패: ${response.status} ${response.statusText}`,
    )
  }

  const data: DailyQuizSetResponse = await response.json()
  return normalizeDailyQuizSet(data)
}
