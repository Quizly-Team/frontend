import type { DailyQuizSet } from '@/types/dailyQuiz'

// Figma 문자열 전량을 이 파일에 격리한다. 화면 컴포넌트에 문자열 리터럴을 남기지 않는다. (#116)
// Q2와 Q3의 정답·해설은 Figma 프레임에 정의되지 않아 원본 자료 본문에서 도출했다. 백엔드 스펙 확정 시 교체한다.

export const mockDailyQuizSet: DailyQuizSet = {
  title: '오늘의 OX 퀴즈 (3문제)',
  intro: {
    badges: ['Daily', '5min'],
    headline: '5분 상식 퀴즈',
    subheadline: 'AI가 출제하는 오늘의 상식 문제',
    description: [
      {
        text: "최근 글로벌 기후 규제의 핵심으로 떠오른 '이 기체'를 아시나요?\n\n뉴스에서 자주 접했지만 헷갈렸던 환경 상식, Quizly ",
      },
      { text: 'AI가 준비한 3문항의 미니 OX 퀴즈', accent: 'primary' },
      { text: '로 가볍게 점검해 보세요!' },
    ],
    startLabel: '오늘의 퀴즈 시작하기',
  },
  source: {
    title: 'AI가 읽은 원본 자료',
    subtitle: 'AI가 출제하는 오늘의 상식 문제',
    fileName: 'climate_methane_2024.txt',
    body: [
      {
        text: '온실 효과(Greenhouse Effect)란 지구 대기가 태양 복사 에너지를 흡수하고, 지구 표면에서 방출되는 열 에너지의 일부를 대기 중에 붙잡아 지구를 따뜻하게 유지하는 자연 현상이다.\n\n특히 ',
      },
      { text: '메탄(CH₄)', accent: 'info' },
      { text: '은 이산화탄소보다 ' },
      { text: '약 21배', accent: 'error' },
      {
        text: ' 강력한 온실가스로, 주로 축산업, 논농사, 천연가스 누출 등에서 발생한다.\n\n대기 중 메탄 농도가 증가하면 지구 평균 기온이 상승하여 기후 변화를 가속화시키며, 과학자들은 메탄 배출량을 줄이기 위한 다양한 방안을 연구하고 있다.',
      },
    ],
    tags: ['온실효과', '메테인(CH₄)', '이산화탄소(CO₂)', '기후 완화'],
    notice:
      'Quizly AI가 위 원본 자료의 핵심 맥락을 분석하여 정교한 OX 퀴즈를 추출했습니다. 문제를 풀어보세요!',
  },
  questions: [
    {
      id: 1,
      text: '메탄(CH₄)은 이산화탄소보다 약 21배 강력한 온실가스이다.',
      options: ['O', 'X'],
      answer: 'O',
      explanation:
        '메탄은 지구온난화 지수(GWP)가 이산화탄소의 약 21배에 달해, 100년 기준으로 훨씬 강력한 온실가스입니다.',
    },
    {
      id: 2,
      text: '메탄(CH₄)은 주로 축산업, 논농사, 천연가스 누출 등에서 발생한다.',
      options: ['O', 'X'],
      answer: 'O',
      explanation:
        '원본 자료는 메탄의 주요 배출원으로 축산업, 논농사, 천연가스 누출을 들고 있습니다.',
    },
    {
      id: 3,
      text: '온실 효과는 완전히 인간 활동에 의해 만들어진 인위적인 현상이다.',
      options: ['O', 'X'],
      answer: 'X',
      explanation:
        '온실 효과는 지구 대기가 열 에너지를 붙잡아 지구를 따뜻하게 유지하는 자연 현상입니다. 인간 활동은 이 효과를 강화할 뿐, 현상 자체를 만들어낸 것은 아닙니다.',
    },
  ],
  result: {
    headline: [
      { text: '긴 텍스트 정리하기 귀찮을 땐,\n이제 ' },
      { text: '퀴즐리', accent: 'primary' },
      { text: '에게 맡기세요!' },
    ],
    description: [
      {
        text: '오늘 푼 상식 퀴즈처럼, 전공 서적이나 시사 잡지를 퀴즐리에 넣어보세요.\n사진만 찍어 올려도 ',
      },
      {
        text: 'AI가 즉시 정교한 시험 문제를 만들어 줍니다.',
        accent: 'primary',
      },
    ],
    ctaLabel: '3초만에 소셜미디어 가입하기',
  },
}
