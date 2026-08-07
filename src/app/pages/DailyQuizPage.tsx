import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DailyQuizQuestionCard,
  DailyQuizResult,
  DailyQuizSourcePanel,
  Header,
} from '@/components'
import { markDailyQuizCompleted } from '@/lib/dailyQuizCompletion'
import { mockDailyQuizSet } from '@/mocks/dailyQuizData'
import type { DailyQuizChoice, DailyQuizTextSpan } from '@/types/dailyQuiz'

// TODO(#116): 백엔드 스펙 확정 시 이 한 줄만 useDailyQuizSet() 훅 호출로 교체한다.
const quizSet = mockDailyQuizSet

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

type Phase = 'intro' | 'solving' | 'result'

/** 모바일 전용 스텝. 데스크톱·태블릿 마크업은 이 값을 읽지 않는다 */
type Pane = 'source' | 'question'

const DailyQuizPage = () => {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(DailyQuizChoice | null)[]>(() =>
    quizSet.questions.map(() => null),
  )
  const [pane, setPane] = useState<Pane>('source')

  const currentQuestion = quizSet.questions[index]
  const selected = answers[index]
  const isFirst = index === 0
  const isLast = index === quizSet.questions.length - 1

  const handleStart = () => {
    setPhase('solving')
    setIndex(0)
    setPane('source')
  }

  const handleSelect = (choice: DailyQuizChoice) => {
    setAnswers((prev) =>
      prev.map((answer, order) => (order === index ? choice : answer)),
    )
  }

  const handlePrev = () => {
    setIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    if (isLast) {
      setPhase('result')
      markDailyQuizCompleted()
      return
    }
    setIndex((prev) => prev + 1)
  }

  const handleMobilePrev = () => {
    if (isFirst) {
      setPane('source')
      return
    }
    handlePrev()
  }

  const handleMobileNext = () => {
    if (pane === 'source') {
      setPane('question')
      return
    }
    handleNext()
  }

  const handleCta = () => {
    navigate('/login')
  }

  const score = useMemo(() => {
    const correctCount = answers.filter(
      (answer, order) => answer === quizSet.questions[order].answer,
    ).length
    const total = quizSet.questions.length
    return {
      correctCount,
      wrongCount: total - correctCount,
      accuracy: total === 0 ? 0 : Math.floor((correctCount / total) * 100),
    }
  }, [answers])

  const solvingLayoutClass =
    phase === 'result'
      ? 'hidden max-md:flex'
      : phase === 'solving'
        ? 'flex'
        : 'hidden'

  return (
    <div className="flex-1 w-full bg-bg-home flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-15 max-lg:pt-15 max-md:pt-10 max-md:px-xl max-md:pb-[126px]">
        {phase === 'intro' && (
          <section className="w-[670px] max-lg:w-full flex flex-col gap-[30px] items-end">
            <div className="w-full flex flex-col gap-xl">
              <div className="flex flex-col gap-xs">
                <div className="flex gap-m items-center max-md:gap-s">
                  <h1 className="text-header1-bold max-md:text-[24px]! text-gray-900">
                    {quizSet.intro.headline}
                  </h1>
                  <div className="flex gap-[6px] items-center">
                    {quizSet.intro.badges.map((badge, badgeIndex) => (
                      <span
                        key={badge}
                        className={`px-xs py-[2px] rounded-[4px] text-tint-regular max-md:text-[12px]! max-md:uppercase ${
                          badgeIndex === 0
                            ? 'bg-[#f6fbf4] text-primary'
                            : 'bg-[#eff6ff] text-[#0053e2]'
                        }`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-body2-regular max-md:text-[16px]! text-gray-600">
                  {quizSet.intro.subheadline}
                </p>
              </div>

              <div className="border border-[#9bf081] rounded-[20px] px-xxl py-3xl max-md:p-xl bg-[linear-gradient(130.77deg,#f5fff1_1%,#e9f5fe_100%)]">
                <p className="text-body1-medium max-md:text-[16px]! text-gray-900 whitespace-pre-wrap">
                  {renderSpans(quizSet.intro.description)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="max-md:hidden bg-primary rounded-[6px] px-l py-m text-body3-regular text-white"
            >
              {quizSet.intro.startLabel}
            </button>
          </section>
        )}

        <div
          className={`w-full max-w-[1200px] gap-[80px] max-lg:flex-col max-lg:gap-[40px] ${solvingLayoutClass}`}
        >
          <DailyQuizSourcePanel
            source={quizSet.source}
            className={pane === 'question' ? 'max-md:hidden' : ''}
          />

          <div
            className={`flex-1 flex flex-col gap-xl ${
              pane === 'source' ? 'max-md:hidden' : ''
            }`}
          >
            <div className="flex flex-col gap-xs">
              <h2 className="text-header1-bold max-md:text-[24px]! text-gray-900">
                {quizSet.title}
              </h2>
              <div className="flex gap-[6px] items-center flex-wrap">
                {quizSet.source.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#f6fbf4] text-primary rounded-full px-[6px] py-[3px] max-md:px-xs max-md:py-[2px] text-tint-regular max-md:text-[12px]!"
                  >
                    {`#${tag}`}
                  </span>
                ))}
              </div>
            </div>

            <DailyQuizQuestionCard
              question={currentQuestion}
              order={index + 1}
              selected={selected}
              onSelect={handleSelect}
              onPrev={handlePrev}
              onNext={handleNext}
              isFirst={isFirst}
              isLast={isLast}
            />
          </div>
        </div>

        {/* 결과 — 데스크톱·태블릿 풀페이지 */}
        {phase === 'result' && (
          <DailyQuizResult
            variant="page"
            className="max-md:hidden"
            correctCount={score.correctCount}
            wrongCount={score.wrongCount}
            accuracy={score.accuracy}
            result={quizSet.result}
            onCta={handleCta}
          />
        )}
      </main>

      {/* 결과 — 모바일 바텀시트 */}
      {phase === 'result' && (
        <>
          <div className="hidden max-md:block fixed inset-0 bg-black/50" />
          <div className="hidden max-md:block fixed bottom-0 left-0 right-0 z-10 bg-white rounded-t-[30px]">
            <DailyQuizResult
              variant="sheet"
              correctCount={score.correctCount}
              wrongCount={score.wrongCount}
              accuracy={score.accuracy}
              result={quizSet.result}
              onCta={handleCta}
            />
          </div>
        </>
      )}

      {/* 모바일 하단 고정 버튼바 */}
      {phase !== 'result' && (
        <div className="hidden max-md:flex fixed bottom-0 left-0 right-0 h-[106px] bg-white px-xl pt-l items-start gap-[10px]">
          {phase === 'intro' ? (
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 bg-primary rounded-[6px] px-xl py-[14px] text-body2-regular text-white"
            >
              {quizSet.intro.startLabel}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleMobilePrev}
                disabled={pane === 'source'}
                className="w-[92px] shrink-0 bg-white border border-[#d9d9d9] rounded-[6px] px-xl py-[14px] text-body2-regular text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleMobileNext}
                disabled={pane === 'question' && selected === null}
                className="flex-1 bg-primary disabled:bg-gray-400 rounded-[6px] px-xl py-[14px] text-body2-regular text-white"
              >
                {pane === 'source'
                  ? quizSet.intro.startLabel
                  : isLast
                    ? '문제 결과 보기'
                    : '다음 문제 풀기'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DailyQuizPage
