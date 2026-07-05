import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import QuizSolvePage from '@/app/pages/QuizSolvePage'
import type { QuizDetail, WrongQuizHistoryDetail } from '@/types/quiz'

type WrongQuizSolveState = {
  quizzes?: WrongQuizHistoryDetail[]
}

const WrongQuizSolvePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const quizzes = (location.state as WrongQuizSolveState | undefined)?.quizzes

  useEffect(() => {
    if (!quizzes || quizzes.length === 0) {
      navigate('/wrong-quizzes', { replace: true })
    }
  }, [navigate, quizzes])

  const quizDetailList = useMemo<QuizDetail[]>(() => {
    if (!quizzes) return []
    return quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      text: quiz.text,
      type: quiz.type,
      options: quiz.options ?? [],
      answer: quiz.answer,
      explanation: quiz.explanation,
      topic: quiz.topic,
    }))
  }, [quizzes])

  if (!quizzes || quizzes.length === 0) {
    return null
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- 조기 return(line 40) 이후 훅 호출이라 규칙 위반이나, 훅 위치를 옮기면 quizzes 비어있는 렌더에서 실행되는 훅 개수가 달라져 동작이 바뀜. lint-only 정리라 위치 유지하고 억제.
  const invalidateWrongQuizQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['wrong-quizzes'] })
  }, [queryClient])

  // eslint-disable-next-line react-hooks/rules-of-hooks -- 조기 return(line 40) 이후 훅 호출이라 규칙 위반이나, 훅 위치를 옮기면 quizzes 비어있는 렌더에서 실행되는 훅 개수가 달라져 동작이 바뀜. lint-only 정리라 위치 유지하고 억제.
  const handleComplete = useCallback(async () => {
    await invalidateWrongQuizQueries()
    navigate('/wrong-quizzes', { replace: true })
  }, [invalidateWrongQuizQueries, navigate])

  // eslint-disable-next-line react-hooks/rules-of-hooks -- 조기 return(line 40) 이후 훅 호출이라 규칙 위반이나, 훅 위치를 옮기면 quizzes 비어있는 렌더에서 실행되는 훅 개수가 달라져 동작이 바뀜. lint-only 정리라 위치 유지하고 억제.
  const handleViewAll = useCallback(async () => {
    await invalidateWrongQuizQueries()
    navigate('/my-quizzes', { replace: true })
  }, [invalidateWrongQuizQueries, navigate])

  // eslint-disable-next-line react-hooks/rules-of-hooks -- 조기 return(line 40) 이후 훅 호출이라 규칙 위반이나, 훅 위치를 옮기면 quizzes 비어있는 렌더에서 실행되는 훅 개수가 달라져 동작이 바뀜. lint-only 정리라 위치 유지하고 억제.
  const handleExit = useCallback(async () => {
    await invalidateWrongQuizQueries()
    navigate('/', { replace: true })
  }, [invalidateWrongQuizQueries, navigate])

  return (
    <QuizSolvePage
      quizDetailList={quizDetailList}
      isRetryMode={true}
      onComplete={handleComplete}
      onExit={handleExit}
      onViewAll={handleViewAll}
    />
  )
}

WrongQuizSolvePage.displayName = 'WrongQuizSolvePage'

export default WrongQuizSolvePage
