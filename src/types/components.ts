// Button Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

// Icon Types
export type IconName =
  | 'search'
  | 'light'
  | 'write'
  | 'book'
  | 'close'
  | 'calendar'
  | 'check'
  | 'delete'
  | 'upload'
  | 'note'
  | 'checkbox'
  | 'memo'
  | 'menu'
  | 'arrow'
  | 'correct'
  | 'error';

// Input Types
export type InputType = 'text' | 'email' | 'password' | 'number';

// Quiz Types
export type Quiz = {
  id: string;
  questionNumber: number;
  question: string;
  answer: string;
  explanation: string;
  isCorrect?: boolean;
};

export type QuizResult = {
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  quizzes: Quiz[];
};
