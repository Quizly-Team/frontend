import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import QuizSolvePage from '@/app/pages/QuizSolvePage';
import type {
  QuizDetail,
  WrongQuizHistoryDetail,
  UserAnswer,
} from '@/types/quiz';

type WrongQuizSolveState = {
  quizzes?: WrongQuizHistoryDetail[];
};

const WrongQuizSolvePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const quizzes = (location.state as WrongQuizSolveState | undefined)?.quizzes;

  useEffect(() => {
    if (!quizzes || quizzes.length === 0) {
      navigate('/wrong-quizzes', { replace: true });
    }
  }, [navigate, quizzes]);

  const quizDetailList = useMemo<QuizDetail[]>(() => {
    if (!quizzes) return [];
    return quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      text: quiz.text,
      type: quiz.type,
      options: quiz.options ?? [],
      answer: quiz.answer,
      explanation: quiz.explanation,
      topic: quiz.topic,
    }));
  }, [quizzes]);

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  const invalidateWrongQuizQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['wrong-quizzes'] });
  }, [queryClient]);

  const handleComplete = useCallback(
    async (_answers: UserAnswer[]) => {
      await invalidateWrongQuizQueries();
      navigate('/wrong-quizzes', { replace: true });
    },
    [invalidateWrongQuizQueries, navigate]
  );

  const handleViewAll = useCallback(
    async (_answers: UserAnswer[]) => {
      await invalidateWrongQuizQueries();
      navigate('/my-quizzes', { replace: true });
    },
    [invalidateWrongQuizQueries, navigate]
  );

  const handleExit = useCallback(async () => {
    await invalidateWrongQuizQueries();
    navigate('/', { replace: true });
  }, [invalidateWrongQuizQueries, navigate]);

  return (
    <QuizSolvePage
      quizDetailList={quizDetailList}
      onComplete={handleComplete}
      onExit={handleExit}
      onViewAll={handleViewAll}
    />
  );
};

WrongQuizSolvePage.displayName = 'WrongQuizSolvePage';

export default WrongQuizSolvePage;

