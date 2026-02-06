import { useMemo } from 'react';
import type { CumulativeSummary as CumulativeSummaryType } from '@/api/dashboard';
import Icon from '@/components/common/Icon';

type Props = {
  data: CumulativeSummaryType;
};

export default function CumulativeSummary({ data }: Props) {
  const accuracyRate =
    data.solvedCount > 0
      ? ((data.correctCount / data.solvedCount) * 100).toFixed(1)
      : '0.0';

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getMonth() + 1}월`;
  }, []);

  return (
    <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] max-md:p-[20px] w-full max-w-[976px] max-lg:max-w-[904px] max-md:w-[250px] max-md:h-[298px] max-md:flex max-md:flex-col">
      <h3 className="text-[20px] max-md:text-[20px] font-medium text-[#222] mb-[44px] max-md:mb-[30px] max-md:flex-shrink-0 max-md:w-[157px] max-md:h-[28px]">
        {currentMonth} 누적 학습 통계
      </h3>

      <div className="flex items-center justify-center gap-[180px] max-lg:gap-[100px] max-md:flex-col max-md:gap-[16px] mb-[48px] max-md:mb-0 max-md:flex-1 max-md:justify-center max-md:items-start">
        {/* 풀이 개수 */}
        <div className="flex items-center gap-[16px] max-md:h-[52px]">
          <div className="w-[54px] h-[54px] bg-[#eff6ff] rounded-[12px] flex items-center justify-center max-md:w-[54px] max-md:h-[54px]">
            <Icon name="dashboard_check" size={24} />
          </div>
          <div className="w-[62px]">
            <p className="text-[14px] text-[#777] mb-[0px]">풀이 개수</p>
            <p className="text-[24px] font-bold text-[#222]">
              {data.solvedCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 전체 정답률 */}
        <div className="flex items-center gap-[16px] max-md:h-[52px]">
          <div className="w-[54px] h-[54px] bg-[#effdf4] rounded-[12px] flex items-center justify-center flex-shrink-0 max-md:w-[54px] max-md:h-[54px]">
            <Icon name="dashboard_up" size={24} />
          </div>
          <div>
            <p className="text-[14px] text-[#777] mb-[0px] whitespace-nowrap">
              전체 정답률
            </p>
            <p className="text-[24px] font-bold text-[#222]">{accuracyRate}%</p>
          </div>
        </div>

        {/* 오답 개수 */}
        <div className="flex items-center gap-[16px] max-md:h-[52px]">
          <div className="w-[54px] h-[54px] bg-[#fef3f2] rounded-[12px] flex items-center justify-center max-md:w-[54px] max-md:h-[54px]">
            <Icon name="dashboard_delete" size={24} />
          </div>
          <div className="w-[62px]">
            <p className="text-[14px] text-[#777] mb-[0px]">오답 개수</p>
            <p className="text-[24px] font-bold text-[#222]">
              {data.wrongCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#dedede] pt-[20px] -mx-[30px] px-[30px] max-md:hidden">
        <div className="flex items-center justify-center gap-[6px]">
          <Icon name="dashboard_i" size={20} />
          <p className="text-[16px] text-[#777]">
            다시 푼 문제는 통계에 들어가지 않습니다
          </p>
        </div>
      </div>
    </div>
  );
}

CumulativeSummary.displayName = 'CumulativeSummary';
