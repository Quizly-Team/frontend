import type { MockExamDetail } from '@/types/quiz';

type MockExamQuestionProps = {
  question: MockExamDetail;
  questionNumber: number;
  showAnswer?: boolean;
};

const MockExamQuestion = ({ question, questionNumber, showAnswer = false }: MockExamQuestionProps) => {
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'TRUE_FALSE':
        return renderTrueFalse();
      case 'FIND_CORRECT':
      case 'FIND_INCORRECT':
        return renderMultipleChoice();
      case 'FIND_MATCH':
        return renderFindMatch();
      case 'SHORT_ANSWER':
        return renderShortAnswer();
      case 'ESSAY':
        return renderEssay();
      default:
        return null;
    }
  };

  const renderTrueFalse = () => (
    <div className="py-3">
      <p className="text-lg font-medium text-[#222222] leading-[1.4] mb-2">
        {questionNumber}. {question.text}
      </p>
      {!showAnswer && (
        <p className="text-base font-normal text-[#555555] leading-[1.4]">
          (O / X)
        </p>
      )}
    </div>
  );

  const renderMultipleChoice = () => {
    const displayText = question.text;

    return (
      <div className="py-3">
        <p className="text-lg font-medium text-[#222222] leading-[1.4] mb-3">
          {questionNumber}. {displayText}
        </p>
        {!showAnswer && question.options.length > 0 && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-start gap-[6px]">
                <div className="relative flex-shrink-0 w-[18px] h-[18px] mt-[2px]" data-option-number>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="8.5" stroke="#555555" strokeWidth="1" />
                    </svg>
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-[#555555] leading-none">
                    {index + 1}
                  </span>
                </div>
                <p className="text-base font-normal text-[#555555] leading-[1.4] flex-1">
                  {option}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFindMatch = () => {
    const questionText = question.text.split('\n<보기>')[0] || question.text;
    const viewOptions = question.text.match(/ㄱ\..+|ㄴ\..+|ㄷ\..+|ㄹ\..+/g) || [];

    return (
      <div className="py-3">
        <p className="text-lg font-medium text-[#222222] leading-[1.4] mb-3">
          {questionNumber}. {questionText}
        </p>
        {!showAnswer && (
          <>
            {/* 보기 박스 */}
            <div className="mb-3 p-4 border border-[#222222] rounded-md bg-white relative">
              <p className="text-base font-normal text-[#222222] leading-[1.4] mb-3 text-center">
                {'< 보기 >'}
              </p>
              <div className="space-y-3">
                {viewOptions.map((option, index) => (
                  <p key={index} className="text-base font-normal text-[#222222] leading-[1.4]">
                    {option}
                  </p>
                ))}
              </div>
            </div>

            {/* 선택지 */}
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-start gap-[6px]">
                  <div className="relative flex-shrink-0 w-[18px] h-[18px] mt-[2px]" data-option-number>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8.5" stroke="#555555" strokeWidth="1" />
                      </svg>
                    </div>
                    <span className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-[#555555] leading-none">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-base font-normal text-[#555555] leading-[1.4] flex-1">
                    {option}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderShortAnswer = () => (
    <div className="py-3">
      <p className="text-lg font-medium text-[#222222] leading-[1.4] mb-3">
        {questionNumber}. {question.text}
      </p>
      {!showAnswer && (
        <div className="bg-white border-0 rounded-md p-3 h-[140px]">
          {/* 빈 답안 작성 영역 */}
        </div>
      )}
    </div>
  );

  const renderEssay = () => (
    <div className="py-3">
      <p className="text-lg font-medium text-[#222222] leading-[1.4] mb-3 whitespace-pre-line">
        {questionNumber}. {question.text}
      </p>
      {!showAnswer && (
        <div className="bg-white border-0 rounded-md p-3 h-[140px]">
          {/* 빈 답안 작성 영역 */}
        </div>
      )}
    </div>
  );

  const renderAnswer = () => {
    if (!showAnswer) return null;

    return (
      <div className="space-y-2">
        <p className="text-base font-medium text-primary">
          해설 요약
        </p>
        <p className="text-base text-[#555555] leading-[1.4] whitespace-pre-line">
          {question.explanation}
        </p>
      </div>
    );
  };

  if (showAnswer) {
    // 객관식 문제의 경우 답의 번호를 찾기
    const getAnswerWithNumber = () => {
      const isMultipleChoice =
        question.type === 'FIND_CORRECT' ||
        question.type === 'FIND_INCORRECT' ||
        question.type === 'FIND_MATCH';

      if (isMultipleChoice && question.options.length > 0) {
        const answerIndex = question.options.findIndex(option => option === question.answer);
        if (answerIndex !== -1) {
          return `${answerIndex + 1}번. ${question.answer}`;
        }
      }
      return question.answer;
    };

    // 해설 모드: 간단하게 문제번호 + 답 + 해설만 표시
    return (
      <div className="pb-3 mb-3">
        <p className="text-lg font-medium text-[#222222] mb-2">
          {questionNumber}. {getAnswerWithNumber()}
        </p>
        {renderAnswer()}
      </div>
    );
  }

  // 문제 모드: 전체 문제 표시
  return (
    <div className="pb-3 mb-3">
      {renderQuestionContent()}
    </div>
  );
};

MockExamQuestion.displayName = 'MockExamQuestion';

export default MockExamQuestion;
