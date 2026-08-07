import { Link } from 'react-router-dom'
import { Icon } from '@/components'
import type { IconName } from '@/components/common/Icon'

type DailyQuizEntryCardBadge = {
  label: string
  className: string
}

type DailyQuizEntryCardProps = {
  icon: IconName
  iconBoxClassName: string
  title: string
  badge: DailyQuizEntryCardBadge
  description: string
  to?: string
  completed?: boolean
  className?: string
}

const DailyQuizEntryCard = ({
  icon,
  iconBoxClassName,
  title,
  badge,
  description,
  to,
  completed = false,
  className = '',
}: DailyQuizEntryCardProps) => {
  const content = (
    <>
      <div
        className={`size-10 rounded-[8px] shrink-0 flex items-center justify-center ${iconBoxClassName}`}
      >
        <Icon name={icon} size={25} />
      </div>

      <div className="flex flex-col gap-[2px] justify-center min-w-0">
        <div className="flex gap-[6px] items-start">
          <span className="text-body3-medium text-gray-900 truncate">
            {title}
          </span>
          <span
            className={`shrink-0 px-xs py-[2px] rounded-[4px] text-[12px] font-medium leading-[1.4] ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <span className="text-tint-regular text-gray-600 truncate">
          {description}
        </span>
      </div>

      {completed && (
        <Icon
          name="check_blue"
          size={20}
          className="ml-auto shrink-0 self-center"
        />
      )}
    </>
  )

  const cardClassName = `bg-white rounded-[8px] px-m py-[10px] flex items-center gap-m drop-shadow-[4px_4px_6px_rgba(0,0,0,0.04)] ${className}`

  // TODO(#116): 가이드 화면 미정. 라우트 확정 시 to prop 연결
  if (!to) {
    return <div className={cardClassName}>{content}</div>
  }

  return (
    <Link to={to} className={cardClassName}>
      {content}
    </Link>
  )
}

export default DailyQuizEntryCard
