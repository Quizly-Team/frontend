import type { DailyQuizSource } from '@/types/dailyQuiz'

const TRAFFIC_LIGHT_CLASS = ['bg-[#ff5f57]', 'bg-[#febc2e]', 'bg-[#28c840]']

type DailyQuizSourcePanelProps = {
  source: DailyQuizSource
  className?: string
}

const DailyQuizSourcePanel = ({
  source,
  className = '',
}: DailyQuizSourcePanelProps) => (
  <section
    className={`w-[400px] max-lg:w-full flex flex-col gap-xl ${className}`}
  >
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-xs">
        <h2 className="text-header1-bold max-md:text-[24px]! text-gray-900">
          {source.title}
        </h2>
        <p className="text-body2-regular max-md:text-[16px]! text-gray-600">
          {source.subtitle}
        </p>
      </div>

      <div className="flex flex-col">
        <div className="bg-[#f0f5f9] border border-b-0 border-[#dedede] rounded-t-[20px] px-xl py-[10px] flex items-center gap-m">
          <div className="flex gap-[6px] shrink-0">
            {TRAFFIC_LIGHT_CLASS.map((colorClass) => (
              <span
                key={colorClass}
                className={`size-3 rounded-full ${colorClass}`}
              />
            ))}
          </div>
          {source.label && (
            <span className="text-body3-regular text-gray-400 truncate">
              {source.label}
            </span>
          )}
        </div>

        <div className="bg-white border border-[#dedede] rounded-b-[20px] p-xl max-h-[420px] max-lg:max-h-none overflow-y-auto">
          <p className="text-body3-regular text-gray-900 whitespace-pre-wrap">
            {source.body}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-[#eff6ff] rounded-[8px] px-m py-[10px]">
      <p className="text-body3-regular text-[#0053e2]">{source.notice}</p>
    </div>
  </section>
)

export default DailyQuizSourcePanel
