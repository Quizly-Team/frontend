import { useMemo } from 'react'
import type {
  TodaySummary as TodaySummaryType,
  DailySummary,
} from '@/api/dashboard'
import Icon from '@/components/common/Icon'

type Props = {
  data: TodaySummaryType
  dailyData: DailySummary[]
}

export default function TodaySummary({ data, dailyData }: Props) {
  const longestStreak = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return 0

    const sortedData = [...dailyData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let maxStreak = 0
    let currentStreak = 0

    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].solvedCount === 0) {
        currentStreak = 0
        continue
      }

      const isConsecutive =
        i > 0 &&
        sortedData[i - 1].solvedCount > 0 &&
        new Date(sortedData[i].date).getTime() -
          new Date(sortedData[i - 1].date).getTime() ===
          24 * 60 * 60 * 1000

      if (!isConsecutive && sortedData[i].solvedCount > 0) {
        currentStreak = 1
      } else if (isConsecutive) {
        currentStreak++
      }

      maxStreak = Math.max(maxStreak, currentStreak)
    }

    return maxStreak
  }, [dailyData])

  const accuracyRate = useMemo(() => {
    if (data.solvedCount === 0) return 0
    return Math.round((data.correctCount / data.solvedCount) * 100)
  }, [data])

  const currentMonth = useMemo(() => {
    const now = new Date()
    return `${now.getMonth() + 1}월`
  }, [])

  return (
    <div className="bg-primary-normal rounded-lg px-8 pt-8 pb-15 w-full max-w-[976px] max-lg:max-w-[904px] max-md:w-[250px] max-md:h-[298px] max-md:px-5 max-md:pt-5 max-md:pb-5 max-md:flex max-md:flex-col">
      <h3 className="text-2md-medium max-md:text-2md-medium text-static-white mb-13 max-md:mb-8 max-md:flex-shrink-0 max-md:w-[157px] max-md:h-[28px]">
        <span className="max-md:hidden">오늘의 학습 요약</span>
        <span className="hidden max-md:inline">
          {currentMonth} 학습 문제 기록
        </span>
      </h3>

      <div className="flex justify-center gap-45 max-lg:gap-25 max-md:flex-col max-md:gap-4 max-md:items-start max-md:flex-1 max-md:justify-center">
        {/* 풀이 문제 */}
        <div className="flex items-center gap-4 max-md:w-[132px] max-md:h-[52px]">
          <div className="w-[54px] h-[54px] bg-[rgba(255,255,255,0.3)] rounded-md flex items-center justify-center flex-shrink-0 max-md:w-[54px] max-md:h-[54px]">
            <Icon name="dashboard_book" size={24} />
          </div>
          <div>
            <p className="text-2sm-regular text-static-white mb-0">풀이 문제</p>
            <p className="text-2lg-bold text-static-white">
              {data.solvedCount}
            </p>
          </div>
        </div>

        {/* 정답률 */}
        <div className="flex items-center gap-4 max-md:w-[132px] max-md:h-[52px]">
          <div className="w-[54px] h-[54px] bg-[rgba(255,255,255,0.3)] rounded-md flex items-center justify-center flex-shrink-0 max-md:w-[54px] max-md:h-[54px]">
            <Icon name="dashboard_chart" size={24} />
          </div>
          <div>
            <p className="text-2sm-regular text-static-white mb-0">정답률</p>
            <p className="text-2lg-bold text-static-white">{accuracyRate}%</p>
          </div>
        </div>

        {/* 연속 학습 일수 */}
        <div className="flex items-center gap-4 max-md:w-[132px] max-md:h-[52px]">
          <div className="w-[54px] h-[54px] bg-[rgba(255,255,255,0.3)] rounded-md flex items-center justify-center flex-shrink-0 max-md:w-[54px] max-md:h-[54px]">
            <Icon name="dashboard_fire_white" size={24} />
          </div>
          <div>
            <p className="text-2sm-regular text-static-white mb-0">연속 학습</p>
            <p className="text-2lg-bold text-static-white">{longestStreak}일</p>
          </div>
        </div>
      </div>
    </div>
  )
}

TodaySummary.displayName = 'TodaySummary'
