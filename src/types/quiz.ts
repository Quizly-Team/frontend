export type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export type QuizDetail = {
  quizId: number;
  text: string;
  type: QuizType;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
};

export type QuizResponse = {
  success: boolean;
  quizDetailList: QuizDetail[];
};

export type UserAnswer = {
  quizId: number;
  selectedAnswer: string;
  solveTime?: number;
};

export type SubmitAnswerRequest = {
  userAnswer: string;
  solveTime: number;
};

export type SubmitAnswerResponse = {
  success: boolean;
  quizId: number;
  answer: string;
  explanation: string;
  correct: boolean;
};

// 문제 모아보기 API 타입
export type QuizHistoryDetail = {
  quizId: number;
  text: string;
  type: QuizType;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
  isLastSolveCorrect: boolean;
};

export type QuizGroup = {
  group: string;
  quizHistoryDetailList: QuizHistoryDetail[];
};

export type QuizGroupResponse = {
  success: boolean;
  errorCode: string | null;
  quizGroupList: QuizGroup[];
};

// 틀린 문제 조회 API 타입
export type WrongQuizHistoryDetail = {
  quizId: number;
  text: string;
  type: QuizType;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
  isCorrect: boolean;
};

export type WrongQuizGroup = {
  group: string;
  quizHistoryDetailList: WrongQuizHistoryDetail[];
};

export type WrongQuizGroupResponse = {
  quizGroupList: WrongQuizGroup[];
};

export type UpdateQuizzesTopicRequest = {
  topic: string;
  quizIdList: number[];
};

export type UpdateQuizzesTopicResponse = {
  success: boolean;
  errorCode?: string | null;
};