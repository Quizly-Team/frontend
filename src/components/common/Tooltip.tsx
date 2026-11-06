import type { ReactNode } from 'react'

type TooltipProps = {
  children: ReactNode
  position?: 'top' | 'bottom'
  className?: string
}

const Tooltip = ({
  children,
  position = 'bottom',
  className = '',
}: TooltipProps) => {
  const containerStyles =
    position === 'top'
      ? 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20'
      : 'absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20'

  const arrowStyles =
    position === 'top'
      ? 'absolute left-1/2 -translate-x-1/2 w-0 h-0 top-full border-l-[7.8px] border-l-transparent border-r-[7.8px] border-r-transparent border-t-[8.5px] border-t-gray-neutral'
      : 'absolute left-1/2 -translate-x-1/2 w-0 h-0 bottom-full border-l-[7.8px] border-l-transparent border-r-[7.8px] border-r-transparent border-b-[8.5px] border-b-gray-neutral'

  return (
    <div className={`${containerStyles} ${className}`}>
      {/* 삼각형 화살표 */}
      <div className={arrowStyles} />
      {/* 툴팁 내용 */}
      <div className="text-2sm-regular bg-gray-neutral text-static-white px-3 py-2 rounded text-center min-w-max">
        {children}
      </div>
    </div>
  )
}

Tooltip.displayName = 'Tooltip'

export default Tooltip
