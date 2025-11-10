import type { QuizDetail } from '@/types/quiz';

export const mockQuizData: QuizDetail[] = [
  {
    quizId: 1,
    text: '시각디자인에서 게슈탈트 이론은 인간이 시각 정보를 인식하는 방식을 설명하는 중요한 심리학적 원리이다. 다음 중 게슈탈트 이론의 대표적인 조직 원리에 대한 설명으로 옳지 않은 것은 무엇인가?',
    type: 'MULTIPLE_CHOICE',
    options: [
      '근접의 원리: 가까이 있는 요소를 하나의 그룹으로 본다.',
      '유사의 원리: 속성이 비슷한 요소를 관련된 것으로 본다.',
      '연속성의 원리: 시각 흐름이 부드러운 선이나 패턴을 하나로 본다.',
      '가독성의 원리: 명도 대비와 크기로 글자나 이미지를 쉽게 읽게 한다.',
    ],
    answer: '가독성의 원리: 명도 대비와 크기로 글자나 이미지를 쉽게 읽게 한다.',
    explanation:
      '가독성의 원리는 게슈탈트 이론의 조직 원리가 아닙니다. 게슈탈트 이론의 대표적인 원리로는 근접의 원리, 유사의 원리, 연속성의 원리, 폐쇄의 원리 등이 있습니다.',
    topic: '디자인 이론',
  },
  {
    quizId: 2,
    text: 'XP의 기본 원리에 포함되지 않는 것은?',
    type: 'MULTIPLE_CHOICE',
    options: [
      '계획 절차',
      '대규모 릴리즈',
      '상징(Metaphor)',
      '지속적 통합(CI)',
    ],
    answer: '대규모 릴리즈',
    explanation:
      'XP는 소규모 릴리즈를 기본 원리로 하며, 대규모 릴리즈는 XP의 원리에 포함되지 않는다.',
    topic: '개발 방법론',
  },
  {
    quizId: 3,
    text: '분산투자는 위험을 낮추는 데 도움이 된다.',
    type: 'TRUE_FALSE',
    options: ['O', 'X'],
    answer: 'O',
    explanation:
      '분산투자는 여러 자산에 투자하여 위험을 분산시키는 전략으로, 특정 자산의 손실이 전체 포트폴리오에 미치는 영향을 줄일 수 있습니다.',
    topic: '경제',
  },
  {
    quizId: 4,
    text: '식품위생의 대상이 되는 것은 "식품"뿐만 아니라 "식품첨가물", "기구", "용기", "포장"도 포함된다.',
    type: 'TRUE_FALSE',
    options: ['O', 'X'],
    answer: 'O',
    explanation:
      '식품위생법에 따르면 식품위생의 대상은 식품뿐만 아니라 식품첨가물, 기구, 용기, 포장 등도 포함됩니다.',
    topic: '식품위생',
  },
  {
    quizId: 5,
    text: 'React에서 useState는 클래스 컴포넌트에서만 사용할 수 있다.',
    type: 'TRUE_FALSE',
    options: ['O', 'X'],
    answer: 'X',
    explanation:
      'useState는 React Hooks 중 하나로, 함수 컴포넌트에서만 사용할 수 있습니다. 클래스 컴포넌트에서는 this.state를 사용합니다.',
    topic: '프로그래밍',
  },
];
