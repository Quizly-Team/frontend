import type { DailyQuizResultCopy, DailyQuizTextSpan } from '@/types/dailyQuiz'

const ACCENT_CLASS = {
  primary: 'text-primary',
  info: 'text-info',
  error: 'text-error',
} as const

const renderSpans = (spans: DailyQuizTextSpan[]) =>
  spans.map((span, index) => (
    <span
      key={index}
      className={span.accent ? ACCENT_CLASS[span.accent] : undefined}
    >
      {span.text}
    </span>
  ))

type DailyQuizResultProps = {
  variant: 'page' | 'sheet'
  correctCount: number
  wrongCount: number
  accuracy: number
  result: DailyQuizResultCopy
  onCta: () => void
  className?: string
}

const DailyQuizResult = ({
  variant,
  correctCount,
  wrongCount,
  accuracy,
  result,
  onCta,
  className = '',
}: DailyQuizResultProps) => {
  const isSheet = variant === 'sheet'
  const totalCount = correctCount + wrongCount

  return (
    <section
      className={`flex flex-col ${
        isSheet
          ? 'gap-xl px-xl pt-xxl pb-[46px]'
          : 'w-[504px] max-lg:w-full items-center gap-[30px]'
      } ${className}`}
      role={isSheet ? 'dialog' : undefined}
      aria-modal={isSheet ? true : undefined}
      aria-label="퀴즈 결과"
    >
      <div
        className={`flex flex-col gap-xl ${isSheet ? 'items-start' : 'items-center'}`}
      >
        <div className="self-center flex flex-col gap-m items-center">
          <img
            src="/icon/group.svg"
            alt=""
            className="w-[92px] h-[62px] animate-[quiz-bounce_2.4s_ease-in-out_infinite]"
          />
          <span className="bg-[#f6fbf4] text-primary rounded-[4px] px-m py-[6px] text-body2-medium">
            {`퀴즈 완료! ${correctCount}/${totalCount} 정답`}
          </span>
        </div>

        <div
          className={`flex flex-col gap-xl ${
            isSheet ? 'items-start text-left' : 'items-center text-center'
          }`}
        >
          <h2
            className={`whitespace-pre-wrap text-gray-900 ${
              isSheet
                ? 'text-[20px] font-bold leading-[1.4]'
                : 'text-header1-bold'
            }`}
          >
            {renderSpans(result.headline)}
          </h2>
          <p className="text-body3-regular text-gray-600 whitespace-pre-wrap max-md:whitespace-normal">
            {renderSpans(result.description)}
          </p>
        </div>
      </div>

      {!isSheet && (
        <div className="flex gap-m items-center">
          <div className="w-[160px] h-[80px] bg-white border border-[#dedede] rounded-[12px] flex flex-col items-center justify-center">
            <span className="text-tint-regular text-gray-600">문제 정답</span>
            <span className="text-header3-bold text-gray-900">{`${correctCount}문제`}</span>
          </div>
          <div className="w-[160px] h-[80px] bg-white border border-[#dedede] rounded-[12px] flex flex-col items-center justify-center">
            <span className="text-tint-regular text-gray-600">문제 오답</span>
            <span className="text-header3-bold text-error">{`${wrongCount}문제`}</span>
          </div>
          <div className="w-[160px] h-[80px] bg-white border border-[#dedede] rounded-[12px] flex flex-col items-center justify-center">
            <span className="text-tint-regular text-gray-600">정답률</span>
            <span className="text-header3-bold text-info">{`${accuracy}%`}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onCta}
        className={`bg-[linear-gradient(98.16deg,#65DB2A_0%,#1EC9E9_100%)] rounded-[6px] px-xl py-[14px] text-white ${
          isSheet ? 'w-full text-body2-medium' : 'w-[335px] text-body3-medium'
        }`}
      >
        {result.ctaLabel}
      </button>
    </section>
  )
}

export default DailyQuizResult
