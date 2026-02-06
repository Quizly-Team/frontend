import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { QuizTypeSummary } from "@/api/dashboard";

type Props = {
  data: QuizTypeSummary[];
};

const QUIZ_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "객관식",
  TRUE_FALSE: "OX 퀴즈",
};

export default function QuizTypeChart({ data }: Props) {
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const tabletQuery = window.matchMedia("(max-width: 1023px)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    
    const handleTabletChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTablet(e.matches);
    };
    
    const handleMobileChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    handleTabletChange(tabletQuery);
    handleMobileChange(mobileQuery);
    
    tabletQuery.addEventListener("change", handleTabletChange);
    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      tabletQuery.removeEventListener("change", handleTabletChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getMonth() + 1}월`;
  }, []);

  // 모바일에서는 데이터가 없어도 차트를 보여줘야 하므로, 빈 데이터로 처리
  const hasData = data && data.length > 0;

  const chartData = useMemo(() => {
    if (!hasData) {
      // 데이터가 없을 때 기본 차트 데이터 반환
      return [
        { name: "OX 퀴즈", value: 0 },
        { name: "객관식", value: 0 },
      ];
    }

    const sortedData = [...data].sort((a, b) => {
      const order = { TRUE_FALSE: 0, MULTIPLE_CHOICE: 1 };
      return (order[a.quizType as keyof typeof order] ?? 2) - (order[b.quizType as keyof typeof order] ?? 2);
    });

    return sortedData.map((item) => ({
      name: QUIZ_TYPE_LABELS[item.quizType] || item.quizType,
      value:
        item.solvedCount > 0
          ? Math.round((item.correctCount / item.solvedCount) * 100)
          : 0,
    }));
  }, [data, hasData]);

  const summaryMessage = useMemo(() => {
    if (!hasData) {
      return "현재 OX 퀴즈의 정답률은 0%, 객관식 정답률은 0%입니다.";
    }

    const trueFalse = data.find((item) => item.quizType === "TRUE_FALSE");
    const multipleChoice = data.find((item) => item.quizType === "MULTIPLE_CHOICE");

    const trueFalseRate = trueFalse && trueFalse.solvedCount > 0
      ? Math.round((trueFalse.correctCount / trueFalse.solvedCount) * 100)
      : 0;

    const multipleChoiceRate = multipleChoice && multipleChoice.solvedCount > 0
      ? Math.round((multipleChoice.correctCount / multipleChoice.solvedCount) * 100)
      : 0;

    return `현재 OX 퀴즈의 정답률은 ${trueFalseRate}%, 객관식 정답률은 ${multipleChoiceRate}%입니다.`;
  }, [data, hasData]);

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] max-md:p-[20px] w-full max-md:min-h-[306px] max-md:flex max-md:flex-col max-md:relative">
      {/* PC: 일반 표시 */}
      <div className="max-md:hidden">
        <h3 className="text-[20px] font-medium text-[#222] mb-[35px]">
          {currentMonth} 유형별 정답률 비교
        </h3>

        <div className="w-full flex justify-center aspect-[418/263]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#30a10e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4fd328" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#dedede" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: "#222", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#222", fontSize: 16 }}
                height={40}
                padding={{ left: isTablet ? 75 : 80, right: isTablet ? 75 : 80 }}
              />
              <YAxis
                axisLine={{ stroke: "#222", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#777", fontSize: 14 }}
                ticks={[0, 25, 50, 75, 100]}
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
                formatter={(value: number | undefined) => [`${value ?? 0}%`, '정답률']}
              />
              <Bar
                dataKey="value"
                fill="url(#greenGradient)"
                radius={[8, 8, 0, 0]}
                barSize={52}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#f6fbf4] rounded-[4px] px-[12px] py-[10px] mt-[16px]">
          <p className="text-[14px] text-[#30a10e]">
            {summaryMessage}
          </p>
        </div>
      </div>

      {/* 모바일: 블러 처리된 전체 카드 (제목 포함) */}
      <div className="hidden max-md:block absolute inset-0 opacity-80 blur-md pointer-events-none">
        <h3 className="text-[20px] font-medium text-[#222] mb-[20px] px-[20px] pt-[20px]">
          {currentMonth} 유형별 정답률 비교
        </h3>

        <div className="h-[215px] w-full flex justify-center px-[20px]">
          <div className="w-full max-w-[295px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              >
              <defs>
                <linearGradient id="greenGradientMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#30a10e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4fd328" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#dedede" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: "#222", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#222", fontSize: 16 }}
                height={40}
                padding={{ left: 75, right: 75 }}
              />
              <YAxis
                axisLine={{ stroke: "#222", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#777", fontSize: 14 }}
                ticks={[0, 25, 50, 75, 100]}
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
                formatter={(value: number | undefined) => [`${value ?? 0}%`, '정답률']}
              />
              <Bar
                dataKey="value"
                fill="url(#greenGradientMobile)"
                radius={[8, 8, 0, 0]}
                barSize={52}
              />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 모바일: 오버레이 안내 카드 */}
      <div className="hidden max-md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#30a10e] rounded-[12px] w-[calc(100%-48px)] max-w-[240px] min-w-[200px] h-[90px] z-10 p-[20px] flex items-center justify-center">
        <div className="w-full flex items-center gap-[6px]">
          <div className="w-[35px] h-[32px] flex-shrink-0">
            <img 
              src="/characters/character2.png" 
              alt="캐릭터" 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <p className="text-[18px] font-medium text-[#222] leading-[25.2px] text-center flex-1">
            더 많은 <span className="text-primary">학습 분석</span>은<br />PC로 확인 해주세요!
          </p>
        </div>
      </div>
    </div>
  );
}

QuizTypeChart.displayName = "QuizTypeChart";
