import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { TopicSummary } from '@/api/dashboard';

type Props = {
  data: TopicSummary[];
};

export default function TopicChart({ data }: Props) {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getMonth() + 1}월`;
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-[976px] max-lg:w-[904px]">
        <h3 className="text-[20px] font-medium text-[#222] mb-[30px]">
          {currentMonth} 주제별 정답률 비교
        </h3>
        <div className="h-[240px] flex items-center justify-center">
          <p className="text-[#777]">주제별 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const chartData = data.slice(0, 6).map((item) => ({
    name: item.topic.length > 5 ? item.topic.substring(0, 5) + '...' : item.topic,
    fullName: item.topic,
    value: item.solvedCount > 0 ? Math.round((item.correctCount / item.solvedCount) * 100) : 0,
  }));

  const yAxisTicks = [0, 25, 50, 75, 100];

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-[976px] max-lg:w-[904px]">
      <h3 className="text-[20px] font-medium text-[#222] mb-[35px]">
        {currentMonth} 주제별 정답률 비교
      </h3>

      <div className="h-[263px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 30, left: -20, bottom: 0 }} barCategoryGap={100}>
            <CartesianGrid strokeDasharray="0" stroke="#dedede" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: '#222', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#222', fontSize: 16 }}
              height={60}
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
              fill="#ff243e"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#fef3f2] rounded-[4px] px-[12px] py-[10px] mt-[16px]">
        <p className="text-[14px] text-[#ff243e]">
          최근에 생성한 주제 6개만 노출됩니다.
        </p>
      </div>
    </div>
  );
}

TopicChart.displayName = 'TopicChart';
