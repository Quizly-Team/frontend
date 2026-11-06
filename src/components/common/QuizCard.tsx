import type { QuizHistoryDetail } from '@/types/quiz'

type QuizCardProps = {
  quiz: QuizHistoryDetail
  questionNumber: number
}

const QuizCard = ({ quiz, questionNumber }: QuizCardProps) => {
  const isWrong = !quiz.isLastSolveCorrect

  return (
    <div
      className={`bg-background-elevated border border-solid box-border flex flex-col gap-5 p-8 rounded-md max-md:gap-3 max-md:p-4 ${
        isWrong ? 'border-status-negative-normal' : 'border-line-normal'
      }`}
    >
      {/* Question */}
      <div className="flex flex-col gap-1">
        <p className="text-1md-medium max-md:text-1rg-medium text-gray-normal">
          <span className="text-primary-normal">Q{questionNumber}. </span>
          {quiz.text}
        </p>
        <p className="text-1md-medium max-md:text-2sm-regular text-gray-alternative">
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
        <p className="text-1rg-medium max-md:text-2sm-regular text-primary-normal">
          해설 요약
        </p>
        <p className="text-1rg-regular max-md:text-2sm-regular text-gray-normal">
          {quiz.explanation}
        </p>
      </div>
    </div>
  )
}

QuizCard.displayName = 'QuizCard'

export default QuizCard
