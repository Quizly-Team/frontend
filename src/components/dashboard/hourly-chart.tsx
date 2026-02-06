import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // 빈 데이터일 때 기본 0값으로 8개 시간대 생성
      return Array.from({ length: 8 }, (_, i) => ({
        name: `${String(i * 3).padStart(2, '0')}시`,
        value: 0,
        actualValue: 0,
      }));
    }
    return data.map((item) => ({
      name: `${String(item.startHour).padStart(2, '0')}시`,
      value: Math.min(item.solvedCount, 100),
      actualValue: item.solvedCount,
    }));
  }, [data]);

  const peakTimeMessage = useMemo(() => {
    if (!data || data.length === 0) return `${nickname}님의 시간대별 학습 데이터가 없습니다.`;

    const maxCount = Math.max(...data.map((item) => item.solvedCount));
    if (maxCount === 0) return `${nickname}님의 시간대별 학습 데이터가 없습니다.`;

    const peakHours = data.filter((item) => item.solvedCount === maxCount);

    if (peakHours.length === 0) return `${nickname}님의 시간대별 학습 데이터가 없습니다.`;

    const startHour = Math.min(...peakHours.map((h) => h.startHour));
    const endHour = Math.max(...peakHours.map((h) => h.startHour)) + 3;

    return `${nickname}님은 ${String(startHour).padStart(2, '0')}시~${String(endHour).padStart(2, '0')}시 시간대에 푼 문제 수가 가장 많습니다.`;
  }, [data, nickname]);

  const yAxisTicks = [0, 25, 50, 75, 100];

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-full">
      <h3 className="text-[20px] font-medium text-[#222] mb-[35px]">
        {currentMonth} 시간대별 학습 패턴
      </h3>

      <div className="w-full flex justify-center aspect-[418/263]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barCategoryGap={12}
          >
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0053e2" stopOpacity={1} />
                <stop offset="100%" stopColor="#5895ff" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#dedede" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: '#222', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#222', fontSize: 16 }}
              height={40}
              padding={{ left: 15, right: 15 }}
            />
            <YAxis
              axisLine={{ stroke: '#222', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#777', fontSize: 14 }}
              ticks={yAxisTicks}
              domain={[0, 100]}
              interval={0}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #dedede',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{
                color: '#222',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: '#222',
                fontSize: '14px',
              }}
              formatter={(_value: number | undefined, _name: string | undefined, props: any) => [
                `${props.payload.actualValue ?? 0}문제`,
                '풀이 개수'
              ]}
            />
            <Bar
              dataKey="value"
              fill="url(#blueGradient)"
              radius={[8, 8, 0, 0]}
              barSize={isTablet ? 30 : 34}
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
