import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTablet(e.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getMonth() + 1}월`;
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-[478px] max-lg:w-[442px]">
        <h3 className="text-[20px] font-medium text-[#222] mb-[30px]">
          {currentMonth} 유형별 정답률 비교
        </h3>
        <div className="h-[240px] flex items-center justify-center">
          <p className="text-[#777]">유형별 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const chartData = useMemo(() => {
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
  }, [data]);

  const summaryMessage = useMemo(() => {
    const trueFalse = data.find((item) => item.quizType === "TRUE_FALSE");
    const multipleChoice = data.find((item) => item.quizType === "MULTIPLE_CHOICE");

    const trueFalseRate = trueFalse && trueFalse.solvedCount > 0
      ? Math.round((trueFalse.correctCount / trueFalse.solvedCount) * 100)
      : 0;

    const multipleChoiceRate = multipleChoice && multipleChoice.solvedCount > 0
      ? Math.round((multipleChoice.correctCount / multipleChoice.solvedCount) * 100)
      : 0;

    return `현재 OX 퀴즈의 정답률은 ${trueFalseRate}%, 객관식 정답률은 ${multipleChoiceRate}%입니다.`;
  }, [data]);

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] w-[478px] max-lg:w-[442px]">
      <h3 className="text-[20px] font-medium text-[#222] mb-[35px]">
        {currentMonth} 유형별 정답률 비교
      </h3>

      <div className="h-[263px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="0" stroke="#dedede" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: "#222", strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#222", fontSize: 16 }}
              height={40}
            />
            <YAxis
              axisLine={{ stroke: "#222", strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#777", fontSize: 14 }}
              ticks={[0, 25, 50, 75, 100]}
              domain={[0, 100]}
            />
            <Bar
              dataKey="value"
              fill="#30a10e"
              radius={[4, 4, 0, 0]}
              barSize={isTablet ? 52 : 70}
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
  );
}

QuizTypeChart.displayName = "QuizTypeChart";
