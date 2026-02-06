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
    <div className="flex gap-5 max-md:flex-col max-md:gap-[20px]">
      {/* 히트맵 */}
      <div className="min-w-0 flex-1 max-w-[478px] max-lg:max-w-[442px] max-md:max-w-full">
        <DailyHeatmap data={dailyData} />
      </div>

      <div className="min-w-0 flex-1 max-w-[478px] max-lg:max-w-[442px] max-md:max-w-full">
        <div className="grid grid-cols-2 gap-x-[20px] gap-y-[20px] max-lg:gap-x-[20px] max-lg:gap-y-[20px] max-md:grid-cols-2 max-md:gap-[10px] w-full">
        {/* 총 학습 일 */}
        <div className="relative w-full pb-[100%] max-md:relative max-md:w-full max-md:aspect-square max-md:pb-0">
          <div className="absolute inset-0 bg-white border border-[#dedede] rounded-[16px] p-[20px] max-lg:p-[15px] max-md:absolute max-md:inset-0 max-md:p-0 flex flex-col items-center justify-center">
            <div className="w-[80px] h-[80px] max-lg:w-[65px] max-lg:h-[65px] max-md:w-[32%] max-md:aspect-square flex-shrink-0">
              <Icon name="dashboard_3d_fire" size={80} className="w-full h-full" />
            </div>
            <p className="text-[14px] max-lg:text-[13px] max-md:text-[clamp(10px,4vw,14px)] text-[#777] mt-[12px] mb-[6px] max-lg:mt-[10px] max-lg:mb-[5px] max-md:mt-[clamp(4px,2vw,8px)] max-md:mb-[clamp(2px,1vw,4px)]">총 학습 일</p>
            <p className="text-[24px] max-lg:text-[20px] max-md:text-[clamp(16px,6.4vw,24px)] font-bold text-[#222]">{stats.totalStudyDays}일</p>
          </div>
        </div>

        {/* 최장 연속 학습 */}
        <div className="relative w-full pb-[100%] max-md:relative max-md:w-full max-md:aspect-square max-md:pb-0">
          <div className="absolute inset-0 bg-white border border-[#dedede] rounded-[16px] p-[20px] max-lg:p-[15px] max-md:absolute max-md:inset-0 max-md:p-0 flex flex-col items-center justify-center">
            <div className="w-[80px] h-[80px] max-lg:w-[65px] max-lg:h-[65px] max-md:w-[32%] max-md:aspect-square flex-shrink-0">
              <Icon name="dashboard_3d_calendar" size={80} className="w-full h-full" />
            </div>
            <p className="text-[14px] max-lg:text-[13px] max-md:text-[clamp(10px,4vw,14px)] text-[#777] mt-[12px] mb-[6px] max-lg:mt-[10px] max-lg:mb-[5px] max-md:mt-[clamp(4px,2vw,8px)] max-md:mb-[clamp(2px,1vw,4px)]">최장 연속 학습</p>
            <p className="text-[24px] max-lg:text-[20px] max-md:text-[clamp(16px,6.4vw,24px)] font-bold text-[#222]">{stats.maxStreak}일</p>
          </div>
        </div>

        {/* 평균 학습 시간대 */}
        <div className="relative w-full pb-[100%] max-md:relative max-md:w-full max-md:aspect-square max-md:pb-0">
          <div className="absolute inset-0 bg-white border border-[#dedede] rounded-[16px] p-[20px] max-lg:p-[15px] max-md:absolute max-md:inset-0 max-md:p-0 flex flex-col items-center justify-center">
            <div className="w-[80px] h-[80px] max-lg:w-[65px] max-lg:h-[65px] max-md:w-[32%] max-md:aspect-square flex-shrink-0">
              <Icon name="dashboard_3d_clock" size={80} className="w-full h-full" />
            </div>
            <p className="text-[14px] max-lg:text-[13px] max-md:text-[clamp(10px,4vw,14px)] text-[#777] mt-[12px] mb-[6px] max-lg:mt-[10px] max-lg:mb-[5px] max-md:mt-[clamp(4px,2vw,8px)] max-md:mb-[clamp(2px,1vw,4px)]">평균 학습 시간대</p>
            <p className="text-[24px] max-lg:text-[20px] max-md:text-[clamp(16px,6.4vw,24px)] font-bold text-[#222]">{stats.peakTimeRange}</p>
          </div>
        </div>

        {/* 가장 많이 푼 유형 */}
        <div className="relative w-full pb-[100%] max-md:relative max-md:w-full max-md:aspect-square max-md:pb-0">
          <div className="absolute inset-0 bg-white border border-[#dedede] rounded-[16px] p-[20px] max-lg:p-[15px] max-md:absolute max-md:inset-0 max-md:p-0 flex flex-col items-center justify-center">
            <div className="w-[80px] h-[80px] max-lg:w-[65px] max-lg:h-[65px] max-md:w-[32%] max-md:aspect-square flex-shrink-0">
              <Icon name="dashboard_3d_lightbulb" size={80} className="w-full h-full" />
            </div>
            <p className="text-[14px] max-lg:text-[13px] max-md:text-[clamp(10px,4vw,14px)] text-[#777] mt-[12px] mb-[6px] max-lg:mt-[10px] max-lg:mb-[5px] max-md:mt-[clamp(4px,2vw,8px)] max-md:mb-[clamp(2px,1vw,4px)]">가장 많이 푼 유형</p>
            <p className="text-[24px] max-lg:text-[20px] max-md:text-[clamp(16px,6.4vw,24px)] font-bold text-[#222]">{stats.mostSolvedTypeName}</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

LearningStats.displayName = 'LearningStats';
