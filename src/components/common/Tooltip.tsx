import type { ReactNode } from 'react';

type TooltipProps = {
  children: ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
};

const Tooltip = ({ children, position = 'bottom', className = '' }: TooltipProps) => {
  return (
    <div
      className={`absolute ${
        position === 'top'
          ? 'bottom-full left-1/2 -translate-x-1/2 mb-[9px]'
          : 'top-full left-1/2 -translate-x-1/2 mt-[9px]'
      } z-20 ${className}`}
    >
      {/* 삼각형 화살표 */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
          position === 'top'
            ? 'top-full border-l-[7.8px] border-l-transparent border-r-[7.8px] border-r-transparent border-t-[8.5px] border-t-[#333333]'
            : 'bottom-full border-l-[7.8px] border-l-transparent border-r-[7.8px] border-r-transparent border-b-[8.5px] border-b-[#333333]'
        }`}
      />
      {/* 툴팁 내용 */}
      <div className="bg-[#333333] text-white px-3 py-2 rounded-[4px] text-center text-[14px] font-normal leading-[1.4] min-w-max">
        {children}
      </div>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
