import { Icon } from '@/components'

type LoadingStageCardProps = {
  label: string
  isCompleted: boolean
  isActive: boolean
  showExclamation?: boolean
  responsive?: boolean
}

const LoadingStageCard = ({
  label,
  isCompleted,
  isActive,
  showExclamation = false,
  responsive = false,
}: LoadingStageCardProps) => {
  const cardClasses = responsive
    ? 'bg-background-elevated rounded-md px-7 py-6 w-[250px] max-lg:w-[220px] flex flex-col items-center shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)] shrink-0'
    : 'bg-background-elevated rounded-md px-7 py-6 w-[250px] flex flex-col items-center shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)]'

  const textClasses = responsive
    ? 'text-1md-medium max-lg:text-1rg-medium text-gray-normal'
    : 'text-1md-medium text-gray-normal'

  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-1">
        <div className="w-[28px] h-[28px] flex items-center justify-center shrink-0">
          {isCompleted ? (
            <div className="w-[28px] h-[28px] rounded-full bg-primary-normal flex items-center justify-center">
              <Icon name="check_white" size={28} />
            </div>
          ) : isActive ? (
            <div className="w-[28px] h-[28px] border-[3px] border-primary-normal border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-[28px] h-[28px] rounded-full bg-fill-alternative" />
          )}
        </div>
        <span className={textClasses}>
          {label}
          {isCompleted ? (showExclamation ? '!' : '') : '...'}
        </span>
      </div>
    </div>
  )
}

LoadingStageCard.displayName = 'LoadingStageCard'

export default LoadingStageCard
