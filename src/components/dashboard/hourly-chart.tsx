import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { HourlySummary } from '@/api/dashboard';

type Props = {
  data: HourlySummary[];
  nickname?: string;
};

export default function HourlyChart({ data, nickname = '사용자' }: Props) {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTablet(e.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getMonth() + 1}월`;
  }, []);

  const peakTimeMessage = useMemo(() => {
    if (!data || data.length === 0) return '';

    const maxCount = Math.max(...data.map((item) => item.solvedCount));
    const peakHours = data.filter((item) => item.solvedCount === maxCount);

    if (peakHours.length === 0) return '';

    const startHour = Math.min(...peakHours.map((h) => h.startHour));
    const endHour = Math.max(...peakHours.map((h) => h.startHour)) + 3;

    const formatHour = (hour: number) => {
      if (hour < 12) return `오전 ${hour}시`;
      if (hour === 12) return '낮 12시';
      if (hour < 24) return `밤 ${hour - 12}시`;
      return `밤 ${hour - 12}시`;
    };

    return `${nickname}님은 ${formatHour(startHour)}~${formatHour(endHour)}에 문제를 많이 풀었어요.`;
  }, [data, nickname]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-[478px] max-lg:w-[442px]">
        <h3 className="text-[20px] font-medium text-[#222] mb-[30px]">
          {currentMonth} 시간대별 학습 패턴
        </h3>
        <div className="h-[240px] flex items-center justify-center">
          <p className="text-[#777]">시간대별 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: `${String(item.startHour).padStart(2, '0')}시`,
    value: item.solvedCount,
  }));

  const yAxisTicks = [0, 25, 50, 75, 100];

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-[478px] max-lg:w-[442px]">
      <h3 className="text-[20px] font-medium text-[#222] mb-[35px]">
        {currentMonth} 시간대별 학습 패턴
      </h3>

      <div className="h-[263px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barCategoryGap={12}>
            <CartesianGrid strokeDasharray="0" stroke="#dedede" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: '#222', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#222', fontSize: 16 }}
              height={40}
            />
            <YAxis
              axisLine={{ stroke: '#222', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#777', fontSize: 14 }}
              ticks={yAxisTicks}
              domain={[0, 100]}
            />
            <Bar
              dataKey="value"
              fill="#2473fc"
              radius={[4, 4, 0, 0]}
              barSize={isTablet ? 30 : 40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#eff6ff] rounded-[4px] px-[12px] py-[10px] mt-[16px]">
        <p className="text-[14px] text-[#0053e2]">
          {peakTimeMessage}
        </p>
      </div>
    </div>
  );
}

HourlyChart.displayName = 'HourlyChart';
