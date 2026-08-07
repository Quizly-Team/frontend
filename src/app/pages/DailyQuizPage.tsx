import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DailyQuizQuestionCard,
  DailyQuizResult,
  DailyQuizSourcePanel,
  Header,
} from '@/components'
import { useDailyQuizSet } from '@/hooks/useDailyQuizSet'
import { markDailyQuizCompleted } from '@/lib/dailyQuizCompletion'
import type { DailyQuizChoice } from '@/types/dailyQuiz'

type Phase = 'intro' | 'solving' | 'result'

/** 모바일 전용 스텝. 데스크톱·태블릿 마크업은 이 값을 읽지 않는다 */
type Pane = 'source' | 'question'

const DailyQuizPage = () => {
  const navigate = useNavigate()
  const { data: quizSet, isLoading, isError } = useDailyQuizSet()
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(DailyQuizChoice | null)[]>([])
  const [pane, setPane] = useState<Pane>('source')

  const questions = useMemo(() => quizSet?.questions ?? [], [quizSet])

  // 세트가 바뀌어 문항 수가 줄어도 인덱스가 배열 밖으로 나가지 않게 고정한다
  const currentIndex = Math.min(index, Math.max(0, questions.length - 1))
  const currentQuestion = questions[currentIndex]
  const selected = answers[currentIndex] ?? null
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1

  const handleStart = () => {
    setPhase('solving')
    setIndex(0)
    setAnswers([])
    setPane('source')
  }

  const handleSelect = (choice: DailyQuizChoice) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = choice
      return next
    })
  }

  const handlePrev = () => {
    setIndex(Math.max(0, currentIndex - 1))
  }

  const handleNext = () => {
    if (isLast) {
      setPhase('result')
      markDailyQuizCompleted()
      return
    }
    setIndex(currentIndex + 1)
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
    const correctCount = questions.filter(
      (question, order) => answers[order] === question.answer,
    ).length
    const total = questions.length
    return {
      correctCount,
      wrongCount: total - correctCount,
      accuracy: total === 0 ? 0 : Math.floor((correctCount / total) * 100),
    }
  }, [answers, questions])

  if (isLoading || isError || !quizSet || questions.length === 0) {
    const statusMessage = isLoading
      ? '오늘의 퀴즈를 불러오는 중입니다...'
      : isError
        ? '오늘의 퀴즈를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
        : '아직 공개된 오늘의 퀴즈가 없습니다. 내일 다시 확인해 주세요.'

    return (
      <div className="flex-1 w-full bg-bg-home flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-24 px-15 max-md:pt-10 max-md:px-xl">
          <div className="w-full max-w-[670px] bg-white border border-[#dedede] rounded-[16px] px-xl py-20 flex justify-center">
            <p
              className={`text-body3-regular text-center ${
                isError ? 'text-error' : 'text-gray-600'
              }`}
            >
              {statusMessage}
            </p>
          </div>
        </main>
      </div>
    )
  }

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
                  {quizSet.intro.description}
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
              order={currentIndex + 1}
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
