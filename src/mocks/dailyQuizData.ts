import type { DailyQuizSetResponse } from '@/api/dailyQuiz'

// GET /daily-quizzes 의 서버 원본 응답을 그대로 흉내낸다. (#116)
// 화면 형상이 아니라 응답 형상인 이유: mock 모드에서도 normalizeDailyQuizSet을 통과시켜
// 서버 shape 변환 경로가 함께 검증되게 하기 위함이다.
// 화면 고정 카피(뱃지·헤드라인·결과 문구 등)는 서버가 주지 않으므로 여기 없다 — api/dailyQuiz.ts의 DAILY_QUIZ_COPY가 유일한 출처다.
// 본문·문항은 Figma 프레임의 문자열이다. Q2·Q3의 정답·해설은 Figma에 정의되지 않아 원본 자료 본문에서 도출했다.

export const mockDailyQuizResponse: DailyQuizSetResponse = {
  success: true,
  errorCode: null,
  dailyQuizId: 1,
  topic: '환경',
  warmUp:
    "최근 글로벌 기후 규제의 핵심으로 떠오른 '이 기체'를 아시나요?\n\n뉴스에서 자주 접했지만 헷갈렸던 환경 상식, Quizly AI가 준비한 3문항의 미니 OX 퀴즈로 가볍게 점검해 보세요!",
  sourceContent:
    '온실 효과(Greenhouse Effect)란 지구 대기가 태양 복사 에너지를 흡수하고, 지구 표면에서 방출되는 열 에너지의 일부를 대기 중에 붙잡아 지구를 따뜻하게 유지하는 자연 현상이다.\n\n특히 메탄(CH₄)은 이산화탄소보다 약 21배 강력한 온실가스로, 주로 축산업, 논농사, 천연가스 누출 등에서 발생한다.\n\n대기 중 메탄 농도가 증가하면 지구 평균 기온이 상승하여 기후 변화를 가속화시키며, 과학자들은 메탄 배출량을 줄이기 위한 다양한 방안을 연구하고 있다.',
  questions: [
    {
      questionId: 1,
      questionNumber: 1,
      questionText: '메탄(CH₄)은 이산화탄소보다 약 21배 강력한 온실가스이다.',
      answer: 'TRUE',
      explanation:
        '메탄은 지구온난화 지수(GWP)가 이산화탄소의 약 21배에 달해, 100년 기준으로 훨씬 강력한 온실가스입니다.',
      hashtags: ['#온실효과', '#메테인(CH₄)', '#이산화탄소(CO₂)', '#기후 완화'],
    },
    {
      questionId: 2,
      questionNumber: 2,
      questionText:
        '메탄(CH₄)은 주로 축산업, 논농사, 천연가스 누출 등에서 발생한다.',
      answer: 'TRUE',
      explanation:
        '원본 자료는 메탄의 주요 배출원으로 축산업, 논농사, 천연가스 누출을 들고 있습니다.',
      hashtags: ['#메테인(CH₄)', '#온실효과'],
    },
    {
      questionId: 3,
      questionNumber: 3,
      questionText:
        '온실 효과는 완전히 인간 활동에 의해 만들어진 인위적인 현상이다.',
      answer: 'FALSE',
      explanation:
        '온실 효과는 지구 대기가 열 에너지를 붙잡아 지구를 따뜻하게 유지하는 자연 현상입니다. 인간 활동은 이 효과를 강화할 뿐, 현상 자체를 만들어낸 것은 아닙니다.',
      hashtags: ['#온실효과'],
    },
  ],
}
