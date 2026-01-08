import { useMemo } from 'react';
import type { TodaySummary as TodaySummaryType, DailySummary } from '@/api/dashboard';
import Icon from '@/components/common/Icon';

type Props = {
  data: TodaySummaryType;
  dailyData: DailySummary[];
};

export default function TodaySummary({ data, dailyData }: Props) {
  const longestStreak = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return 0;

    const sortedData = [...dailyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let maxStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].solvedCount === 0) {
        currentStreak = 0;
        continue;
      }

      const isConsecutive = i > 0 && sortedData[i - 1].solvedCount > 0 &&
        new Date(sortedData[i].date).getTime() - new Date(sortedData[i - 1].date).getTime() === 24 * 60 * 60 * 1000;

      if (!isConsecutive && sortedData[i].solvedCount > 0) {
        currentStreak = 1;
      } else if (isConsecutive) {
        currentStreak++;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
    }

    return maxStreak;
  }, [dailyData]);

  const accuracyRate = useMemo(() => {
    if (data.solvedCount === 0) return 0;
    return Math.round((data.correctCount / data.solvedCount) * 100);
  }, [data]);

  return (
    <div className="bg-[#30a10e] rounded-[16px] px-[30px] pt-[30px] pb-[60px] w-[976px] max-lg:w-[904px]">
      <h3 className="text-[20px] font-medium text-white mb-[50px]">
        오늘의 학습 요약
      </h3>

      <div className="flex justify-center gap-[180px]">
        {/* 풀이 문제 */}
        <div className="flex items-center gap-[16px]">
          <div className="w-[54px] h-[54px] bg-[rgba(255,255,255,0.3)] rounded-[12px] flex items-center justify-center flex-shrink-0 p-[15px]">
            <Icon name="dashboard_book" size={24} />
          </div>
          <div>
            <p className="text-[14px] text-white mb-[0px]">풀이 문제</p>
            <p className="text-[24px] font-bold text-white">{data.solvedCount}</p>
          </div>
        </div>

        {/* 정답률 */}
        <div className="flex items-center gap-[16px]">
          <div className="w-[54px] h-[54px] bg-[rgba(255,255,255,0.3)] rounded-[12px] flex items-center justify-center flex-shrink-0 p-[15px]">
            <Icon name="dashboard_chart" size={24} />
          </div>
          <div>
            <p className="text-[14px] text-white mb-[0px]">정답률</p>
            <p className="text-[24px] font-bold text-white">{accuracyRate}%</p>
          </div>
        </div>

        {/* 연속 학습 일수 */}
        <div className="flex items-center gap-[16px]">
          <div className="w-[54px] h-[54px] bg-[rgba(255,255,255,0.3)] rounded-[12px] flex items-center justify-center flex-shrink-0 p-[15px]">
            <Icon name="dashboard_fire_white" size={24} />
          </div>
          <div>
            <p className="text-[14px] text-white mb-[0px]">연속 학습</p>
            <p className="text-[24px] font-bold text-white">{longestStreak}일</p>
          </div>
        </div>
      </div>
    </div>
  );
}

TodaySummary.displayName = 'TodaySummary';
