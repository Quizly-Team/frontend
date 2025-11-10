import { useMutation } from '@tanstack/react-query';
import { createQuiz } from '@/api/quiz';
import type { QuizResponse } from '@/types/quiz';

type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

type CreateQuizParams = {
  content: string | File;
  type: QuizType;
  isLoggedIn: boolean;
};

export const useCreateQuiz = () => {
  return useMutation<QuizResponse, Error, CreateQuizParams>({
    mutationFn: async ({ content, type, isLoggedIn }) => {
      return createQuiz(content, type, isLoggedIn);
    },
  });
};
