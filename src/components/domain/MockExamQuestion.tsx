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
    <div className="pt-5">
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
      <div className="pt-5">
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
      <div className="pt-5">
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
    <div className="pt-5">
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
    <div className="pt-5">
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
    // 동그라미 번호를 렌더링하는 함수 (18x18)
    const renderCircleNumber = (num: number) => {
      return (
        <div className="relative inline-flex items-center justify-center w-[18px] h-[18px] align-middle" style={{ marginTop: '-2px' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="absolute">
            <circle cx="9" cy="9" r="8.5" stroke="#222222" strokeWidth="1" />
          </svg>
          <span className="relative text-[13px] font-medium text-[#222222] leading-none">
            {num}
          </span>
        </div>
      );
    };

    // 객관식 문제의 경우 답의 번호를 찾기
    const getAnswerWithNumber = () => {
      // TRUE_FALSE 타입의 경우 O/X로 변환
      if (question.type === 'TRUE_FALSE') {
        if (question.answer === 'TRUE') {
          return 'O';
        } else if (question.answer === 'FALSE') {
          return 'X';
        }
        return question.answer;
      }

      // FIND_CORRECT, FIND_INCORRECT: 동그라미 안에 번호만 표시
      if (question.type === 'FIND_CORRECT' || question.type === 'FIND_INCORRECT') {
        if (question.options.length > 0) {
          const answerIndex = question.options.findIndex(option => option === question.answer);
          if (answerIndex !== -1) {
            return renderCircleNumber(answerIndex + 1);
          }
        }
        return question.answer;
      }

      // FIND_MATCH (보기 유형): 동그라미 안의 번호 + 정답 표시
      if (question.type === 'FIND_MATCH') {
        if (question.options.length > 0) {
          // answer가 options 배열의 텍스트와 일치하는 경우 (선택지 번호 찾기)
          const answerIndex = question.options.findIndex(option => option === question.answer);
          if (answerIndex !== -1) {
            // answer가 옵션 텍스트와 일치하는 경우, 보기 번호는 별도로 저장되어 있을 수 있음
            // 일단 동그라미 번호만 표시 (보기 번호는 answer에 포함되어 있지 않을 수 있음)
            return renderCircleNumber(answerIndex + 1);
          }
          
          // answer가 options에 없는 경우
          // answer에서 선택지 번호를 추출 (숫자 또는 동그라미 번호)
          const numMatch = question.answer.match(/^(\d+)/);
          const circleMatch = question.answer.match(/^([①②③④⑤])/);
          
          if (circleMatch) {
            // 이미 동그라미 번호가 있는 경우 - 숫자 추출
            const circleNumbers = ['①', '②', '③', '④', '⑤'];
            const num = circleNumbers.indexOf(circleMatch[1]) + 1;
            const restOfAnswer = question.answer.replace(/^[①②③④⑤]\s*/, '').trim();
            return (
              <span className="inline-flex items-center gap-1">
                {renderCircleNumber(num)}
                {restOfAnswer && <span>{restOfAnswer}</span>}
              </span>
            );
          } else if (numMatch) {
            // 숫자로 시작하는 경우 (예: "3 ㄱ, ㄷ, ㄹ")
            const num = parseInt(numMatch[1], 10);
            // answer에서 숫자 부분을 제거하고 나머지(보기 번호)를 표시
            const restOfAnswer = question.answer.replace(/^\d+\s*/, '').trim();
            return (
              <span className="inline-flex items-center gap-1">
                {renderCircleNumber(num)}
                {restOfAnswer && <span>{restOfAnswer}</span>}
              </span>
            );
          } else {
            // answer가 보기 번호만 있는 경우 (예: "ㄱ, ㄷ, ㄹ")
            // 선택지 번호를 찾을 수 없으므로, answer를 그대로 표시
            return question.answer;
          }
        }
        return question.answer;
      }

      return question.answer;
    };

    // 해설 모드: 간단하게 문제번호 + 답 + 해설만 표시
    return (
      <div className="pt-5 mb-5">
        <p className="text-lg font-medium text-[#222222] mb-2">
          {questionNumber}. {getAnswerWithNumber()}
        </p>
        {renderAnswer()}
      </div>
    );
  }

  // 문제 모드: 전체 문제 표시
  return (
    <div className="mb-5">
      {renderQuestionContent()}
    </div>
  );
};

MockExamQuestion.displayName = 'MockExamQuestion';

export default MockExamQuestion;
