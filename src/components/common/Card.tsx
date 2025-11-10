type QuizCardProps = {
  questionNumber: number;
  question: string;
  answer: string;
  explanation: string;
  className?: string;
};

const QuizCard = ({
  questionNumber,
  question,
  answer,
  explanation,
  className = '',
}: QuizCardProps) => {
  return (
    <div className={`bg-white border border-gray-300 rounded-[12px] p-8 flex flex-col gap-l ${className}`}>
      {/* Question Section */}
      <div className="flex flex-col gap-xs">
        <p className="text-body2-medium leading-[1.4]">
          <span className="text-primary">Q{questionNumber}. </span>
          <span className="text-gray-900">{question}</span>
        </p>
        <p className="text-body2-medium text-gray-600 leading-[1.4]">
          정답 : {answer}
        </p>
      </div>

      {/* Explanation Section */}
      <div className="flex flex-col gap-xs">
        <p className="text-body3-medium text-primary leading-[1.4]">
          해설 요약
        </p>
        <p className="text-body3-regular text-gray-900 leading-[1.4] whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </div>
  );
};

QuizCard.displayName = 'QuizCard';

export default QuizCard;
