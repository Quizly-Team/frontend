import { useMutation } from '@tanstack/react-query';
import { createMockExam, createMockExamByFile } from '@/api/quiz';
import type { CreateMockExamRequest, MockExamResponse } from '@/types/quiz';

export const useCreateMockExam = () => {
  return useMutation<MockExamResponse, Error, CreateMockExamRequest>({
    mutationFn: createMockExam,
  });
};

export const useCreateMockExamByFile = () => {
  return useMutation<
    MockExamResponse,
    Error,
    { file: File; mockExamTypeList: string[] }
  >({
    mutationFn: ({ file, mockExamTypeList }) =>
      createMockExamByFile(file, mockExamTypeList),
  });
};
