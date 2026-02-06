import { useMemo } from 'react';
import type { DailySummary } from '@/api/dashboard';
import Icon from '@/components/common/Icon';

type Props = {
  data: DailySummary[];
};

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export default function DailyHeatmap({ data }: Props) {
  const { calendarData, currentMonth, fireStreaks } = useMemo(() => {
    // 데이터가 없을 때 현재 월의 빈 달력 생성
    const now = new Date();
    const year = (!data || data.length === 0) ? now.getFullYear() : new Date(Math.min(...data.map((item) => new Date(item.date).getTime()))).getFullYear();
    const month = (!data || data.length === 0) ? now.getMonth() : new Date(Math.min(...data.map((item) => new Date(item.date).getTime()))).getMonth();
    const currentMonth = `${month + 1}월`;

    const dataMap = new Map(data?.map((item) => [item.date, item.solvedCount]) || []);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const adjustedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const weeks: Array<Array<{ date: string; count: number } | null>> = [];
    let currentWeek: Array<{ date: string; count: number } | null> = new Array(adjustedStart).fill(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = dataMap.get(dateStr) || 0;

      currentWeek.push({ date: dateStr, count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    const fireStreaks = new Set<string>();

    // 데이터가 있을 때만 연속 학습 계산
    if (data && data.length > 0) {
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let streakStart = 0;
      for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].solvedCount === 0) {
          streakStart = i + 1;
          continue;
        }

        const isConsecutive = i > 0 && sortedData[i - 1].solvedCount > 0 &&
          new Date(sortedData[i].date).getTime() - new Date(sortedData[i - 1].date).getTime() === 24 * 60 * 60 * 1000;

        if (!isConsecutive && sortedData[i].solvedCount > 0) {
          streakStart = i;
        }

        const streakLength = i - streakStart + 1;
        if (streakLength >= 3 && sortedData[i].solvedCount > 0) {
          for (let j = streakStart; j <= i; j++) {
            fireStreaks.add(sortedData[j].date);
          }
        }
      }
    }

    return { calendarData: weeks, currentMonth, fireStreaks };
  }, [data]);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#efefef]';
    if (count > 0) return 'bg-[#fef3f2]';
    return 'bg-white';
  };

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[20px] max-md:p-[20px] w-full max-md:h-[335px] max-md:flex max-md:flex-col aspect-square max-md:aspect-auto">
      <h3 className="text-[16px] max-md:text-[20px] font-medium text-[#222] mb-[20px] max-md:mb-[20px] max-md:flex-shrink-0">
        {currentMonth} 학습 문제 기록
      </h3>

      <div className="flex flex-col items-center max-md:flex-1 max-md:justify-center w-full">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-[6px] max-md:gap-[6px] mb-[6px] w-full max-w-[396px] max-lg:max-w-[362px] max-md:max-w-[271px]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="flex items-center justify-center">
              <p className="text-[12px] max-md:text-[16px] text-[#777]">{day}</p>
            </div>
          ))}
        </div>

        {/* 날짜 칸 */}
        <div className="flex flex-col gap-[6px] max-md:gap-[6px] mb-[12px] max-md:mb-0 w-full max-w-[396px] max-lg:max-w-[362px] max-md:max-w-[271px]">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-[6px] max-md:gap-[6px]">
              {week.map((cell, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`aspect-square rounded-[4px] flex items-center justify-center ${
                    cell ? getCellColor(cell.count) : 'bg-white'
                  }`}
                >
                  {cell && fireStreaks.has(cell.date) && (
                    <Icon name="dashboard_fire" size={24} className="max-md:w-[20px] max-md:h-[20px]" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-[6px] justify-end max-md:hidden">
        <div className="w-[16px] h-[16px] bg-[#efefef] rounded-[2px]" />
        <div className="w-[16px] h-[16px] bg-[#fef3f2] rounded-[2px]" />
      </div>
    </div>
  );
}

DailyHeatmap.displayName = 'DailyHeatmap';
