type QuizCardProps = {
  questionNumber: number
  question: string
  answer: string
  explanation: string
  className?: string
}

const QuizCard = ({
  questionNumber,
  question,
  answer,
  explanation,
  className = '',
}: QuizCardProps) => {
  return (
    <div
      className={`bg-background-elevated border border-line-normal rounded-[12px] p-8 flex flex-col gap-l ${className}`}
    >
      {/* Question Section */}
      <div className="flex flex-col gap-xs">
        <p className="text-1md-medium">
          <span className="text-primary-normal">Q{questionNumber}. </span>
          <span className="text-gray-normal">{question}</span>
        </p>
        <p className="text-1md-medium text-gray-alternative">정답 : {answer}</p>
      </div>

      {/* Explanation Section */}
      <div className="flex flex-col gap-xs">
        <p className="text-1rg-medium text-primary-normal">해설 요약</p>
        <p className="text-1rg-regular text-gray-normal whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </div>
  )
}

QuizCard.displayName = 'QuizCard'

export default QuizCard
