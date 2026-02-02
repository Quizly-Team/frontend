import { useMemo } from 'react';
import type { DailySummary, QuizTypeSummary, HourlySummary } from '@/api/dashboard';
import Icon from '@/components/common/Icon';
import DailyHeatmap from './daily-heatmap';

type Props = {
  dailyData: DailySummary[];
  quizTypeData: QuizTypeSummary[];
  hourlyData: HourlySummary[];
};

const QUIZ_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: '객관식',
  TRUE_FALSE: 'OX 퀴즈',
};

export default function LearningStats({ dailyData, quizTypeData, hourlyData }: Props) {
  const stats = useMemo(() => {
    // 총 학습 일 계산
    const totalStudyDays = dailyData.filter((day) => day.solvedCount > 0).length;

    // 최장 연속 학습 계산
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedData = [...dailyData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].solvedCount > 0) {
        const isConsecutive =
          i > 0 &&
          sortedData[i - 1].solvedCount > 0 &&
          new Date(sortedData[i].date).getTime() -
            new Date(sortedData[i - 1].date).getTime() ===
            24 * 60 * 60 * 1000;

        if (isConsecutive) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }

        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // 평균 학습 시간대 계산 (가장 많이 푼 시간대)
    let peakTimeRange = '-';
    if (hourlyData && hourlyData.length > 0) {
      const maxCount = Math.max(...hourlyData.map((item) => item.solvedCount));
      const peakHour = hourlyData.find((item) => item.solvedCount === maxCount);
      if (peakHour) {
        const startHour = String(peakHour.startHour).padStart(2, '0');
        const endHour = String(peakHour.startHour + 3).padStart(2, '0');
        peakTimeRange = `${startHour}시~${endHour}시`;
      }
    }

    // 가장 많이 푼 유형
    const mostSolvedType = quizTypeData.reduce(
      (max, current) =>
        current.solvedCount > max.solvedCount ? current : max,
      quizTypeData[0] || { quizType: 'TRUE_FALSE', solvedCount: 0, correctCount: 0, wrongCount: 0 }
    );
    const mostSolvedTypeName = QUIZ_TYPE_LABELS[mostSolvedType.quizType] || mostSolvedType.quizType;

    return {
      totalStudyDays,
      maxStreak,
      peakTimeRange,
      mostSolvedTypeName,
    };
  }, [dailyData, quizTypeData, hourlyData]);

  return (
    <div className="flex gap-5 max-lg:flex-col max-md:flex-col max-md:gap-[20px]">
      {/* PC: 히트맵 */}
      <div className="max-md:hidden">
        <DailyHeatmap data={dailyData} />
      </div>

      <div className="grid grid-cols-2 gap-x-[20px] gap-y-[20px] max-lg:gap-x-[20px] max-lg:gap-y-[20px] max-md:grid-cols-2 max-md:gap-[10px] w-[478px] max-lg:w-[442px] max-md:w-full">
        {/* 총 학습 일 */}
        <div className="bg-white border border-[#dedede] rounded-[16px] p-[20px] w-[229px] h-[229px] max-lg:w-[211px] max-lg:h-[211px] max-lg:p-[20px] max-md:p-0 max-md:w-full max-md:h-[162px] flex flex-col items-center justify-center">
          <div className="max-md:w-[52px] max-md:h-[52px]">
            <Icon name="dashboard_3d_fire" size={80} className="max-md:w-full max-md:h-full" />
          </div>
          <p className="text-[14px] text-[#777] mt-[12px] mb-[6px] max-md:mt-[8px] max-md:mb-[4px]">총 학습 일</p>
          <p className="text-[24px] font-bold text-[#222]">{stats.totalStudyDays}일</p>
        </div>

        {/* 최장 연속 학습 */}
        <div className="bg-white border border-[#dedede] rounded-[16px] p-[20px] w-[229px] h-[229px] max-lg:w-[211px] max-lg:h-[211px] max-lg:p-[20px] max-md:p-0 max-md:w-full max-md:h-[162px] flex flex-col items-center justify-center">
          <div className="max-md:w-[52px] max-md:h-[52px]">
            <Icon name="dashboard_3d_calendar" size={80} className="max-md:w-full max-md:h-full" />
          </div>
          <p className="text-[14px] text-[#777] mt-[12px] mb-[6px] max-md:mt-[8px] max-md:mb-[4px]">최장 연속 학습</p>
          <p className="text-[24px] font-bold text-[#222]">{stats.maxStreak}일</p>
        </div>

        {/* 평균 학습 시간대 */}
        <div className="bg-white border border-[#dedede] rounded-[16px] p-[20px] w-[229px] h-[229px] max-lg:w-[211px] max-lg:h-[211px] max-lg:p-[20px] max-md:p-0 max-md:w-full max-md:h-[162px] flex flex-col items-center justify-center">
          <div className="max-md:w-[52px] max-md:h-[52px]">
            <Icon name="dashboard_3d_clock" size={80} className="max-md:w-full max-md:h-full" />
          </div>
          <p className="text-[14px] text-[#777] mt-[12px] mb-[6px] max-md:mt-[8px] max-md:mb-[4px]">평균 학습 시간대</p>
          <p className="text-[24px] font-bold text-[#222]">{stats.peakTimeRange}</p>
        </div>

        {/* 가장 많이 푼 유형 */}
        <div className="bg-white border border-[#dedede] rounded-[16px] p-[20px] w-[229px] h-[229px] max-lg:w-[211px] max-lg:h-[211px] max-lg:p-[20px] max-md:p-0 max-md:w-full max-md:h-[162px] flex flex-col items-center justify-center">
          <div className="max-md:w-[52px] max-md:h-[52px]">
            <Icon name="dashboard_3d_lightbulb" size={80} className="max-md:w-full max-md:h-full" />
          </div>
          <p className="text-[14px] text-[#777] mt-[12px] mb-[6px] max-md:mt-[8px] max-md:mb-[4px]">가장 많이 푼 유형</p>
          <p className="text-[24px] font-bold text-[#222]">{stats.mostSolvedTypeName}</p>
        </div>
      </div>
    </div>
  );
}

LearningStats.displayName = 'LearningStats';
