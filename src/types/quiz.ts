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
};

export type SubmitAnswerRequest = {
  userAnswer: string;
};

export type SubmitAnswerResponse = {
  success: boolean;
  quizId: number;
  answer: string;
  explanation: string;
  correct: boolean;
};
