import { Icon } from '@/components'
import type { IconName } from '@/components/common/Icon'
import type { DailyQuizChoice, DailyQuizQuestion } from '@/types/dailyQuiz'

type DailyQuizQuestionCardProps = {
  question: DailyQuizQuestion
  order: number
  selected: DailyQuizChoice | null
  onSelect: (choice: DailyQuizChoice) => void
  onPrev: () => void
  onNext: () => void
  isFirst: boolean
  isLast: boolean
  className?: string
}

const DailyQuizQuestionCard = ({
  question,
  order,
  selected,
  onSelect,
  onPrev,
  onNext,
  isFirst,
  isLast,
  className = '',
}: DailyQuizQuestionCardProps) => {
  const isAnswered = selected !== null
  const isCorrect = isAnswered && selected === question.answer

  const cardBorderClass = !isAnswered
    ? 'border-[#dedede]'
    : isCorrect
      ? 'border-info'
      : 'border-error'

  const questionTextClass = !isAnswered
    ? 'text-gray-900'
    : isCorrect
      ? 'text-info'
      : 'text-error'

  const getOptionBorderClass = (option: DailyQuizChoice) => {
    if (selected !== option) return 'border-[#ededed]'
    return isCorrect ? 'border-info' : 'border-error'
  }

  const getOptionIconName = (option: DailyQuizChoice): IconName => {
    if (option === 'O') {
      if (selected !== 'O') return 'correct_black'
      return isCorrect ? 'correct_blue' : 'correct_red'
    }
    if (selected !== 'X') return 'error_black'
    return isCorrect ? 'error_blue' : 'error_red'
  }

  const handleSelect = (choice: DailyQuizChoice) => {
    // 응답 후 재선택 불가
    if (isAnswered) return
    onSelect(choice)
  }

  return (
    <div className={`w-full flex flex-col gap-[30px] items-end ${className}`}>
      <div
        className={`w-full bg-white border rounded-[16px] flex flex-col gap-xl ${cardBorderClass}`}
      >
        <div
          className={`flex flex-col gap-xl items-center px-xxl pt-3xl max-md:px-xl max-md:pt-xl ${
            isAnswered ? '' : 'pb-3xl max-md:pb-xl'
          }`}
        >
          <p
            className={`w-full text-body1-medium max-md:text-[16px]! ${questionTextClass}`}
          >
            <span className={isAnswered ? undefined : 'text-primary'}>
              {`Q${order}. `}
            </span>
            {question.text}
          </p>

          <div className="w-full flex gap-xl max-md:gap-m items-center justify-center">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                aria-label={option}
                aria-pressed={selected === option}
                className={`w-[240px] max-lg:w-auto max-lg:flex-1 h-[86px] max-md:h-[60px] bg-white border rounded-[8px] flex items-center justify-center ${getOptionBorderClass(option)}`}
              >
                <Icon
                  name={getOptionIconName(option)}
                  size={34}
                  className="max-md:size-6"
                />
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <div
            className={`px-xxl py-l max-md:px-xl rounded-b-[16px] flex flex-col gap-[10px] ${
              isCorrect ? 'bg-[#eff6ff]' : 'bg-[#fef3f2]'
            }`}
          >
            <div className="flex gap-s items-center">
              <span
                className={`shrink-0 px-xs py-[2px] rounded-[4px] text-tint-regular text-white ${
                  isCorrect ? 'bg-info' : 'bg-error'
                }`}
              >
                정답!
              </span>
              <span className="text-body2-medium max-md:text-[14px]! text-gray-600">
                {question.answer}
              </span>
            </div>
            <p
              className={`text-body2-medium max-md:text-[14px]! ${
                isCorrect ? 'text-info' : 'text-error'
              }`}
            >
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="max-md:hidden flex gap-m items-center">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="bg-white border border-[#d9d9d9] rounded-[6px] px-l py-m text-body3-regular text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          이전 문제
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isAnswered}
          className="bg-primary disabled:bg-gray-400 rounded-[6px] px-l py-m text-body3-regular text-white"
        >
          {isLast ? '문제 결과 보기' : '다음 문제 풀기'}
        </button>
      </div>
    </div>
  )
}

export default DailyQuizQuestionCard
