import type { QuizHistoryDetail } from '@/types/quiz'

type QuizCardProps = {
  quiz: QuizHistoryDetail
  questionNumber: number
}

const QuizCard = ({ quiz, questionNumber }: QuizCardProps) => {
  const isWrong = !quiz.isLastSolveCorrect

  return (
    <div
      className={`bg-background-elevated border border-solid box-border flex flex-col gap-5 p-8 rounded-[12px] max-md:gap-3 max-md:p-l ${
        isWrong ? 'border-status-negative-normal' : 'border-line-normal'
      }`}
    >
      {/* Question */}
      <div className="flex flex-col gap-1">
        <p className="text-body2-medium text-gray-normal max-md:text-body3-medium">
          <span className="text-primary-normal">Q{questionNumber}. </span>
          {quiz.text}
        </p>
        <p className="text-body2-medium text-gray-alternative max-md:text-tint-regular">
          정답 :{' '}
          {quiz.type === 'TRUE_FALSE'
            ? quiz.answer === 'TRUE'
              ? 'O'
              : quiz.answer === 'FALSE'
                ? 'X'
                : quiz.answer
            : quiz.answer}
        </p>
      </div>

      {/* Explanation */}
      <div className="flex flex-col">
        <p className="text-body3-medium text-primary-normal max-md:text-tint-regular">
          해설 요약
        </p>
        <p className="text-body3-regular text-gray-normal max-md:text-tint-regular">
          {quiz.explanation}
        </p>
      </div>
    </div>
  )
}

QuizCard.displayName = 'QuizCard'

export default QuizCard
