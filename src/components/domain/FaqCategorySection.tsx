import { FAQ_CATEGORIES, type FaqCategory, type FaqDetail } from '@/api/faq'
import { Icon } from '@/components'
import FaqAccordionItem from '@/components/common/FaqAccordionItem'
import type { IconName } from '@/components/common/Icon'

const CATEGORY_ICON: Partial<Record<FaqCategory, IconName>> = {
  SERVICE_INTRO: 'faq_service',
  QUIZ_GENERATION: 'faq_quiz',
  WRONG_ANSWER: 'faq_wrong',
  TECH_SUPPORT: 'faq_support',
}
const FALLBACK_ICON: IconName = 'faq_service'

type FaqCategorySectionProps = {
  category: FaqCategory
  description: string
  items: FaqDetail[]
}

const FaqCategorySection = ({
  category,
  description,
  items,
}: FaqCategorySectionProps) => {
  const label = FAQ_CATEGORIES[category] ?? description
  return (
    <section className="w-full bg-white border border-[#dedede] rounded-[16px] p-[30px] flex flex-col gap-[30px] max-md:p-[20px]">
      <div className="flex items-center gap-[12px] max-md:gap-[8px]">
        <div className="size-10 max-md:size-8 rounded-[6px] bg-[#f6fbf4] flex items-center justify-center shrink-0">
          <Icon
            name={CATEGORY_ICON[category] ?? FALLBACK_ICON}
            size={24}
            className="max-md:size-5"
          />
        </div>
        <h2 className="text-header3-bold text-gray-900 max-md:text-body1-medium">
          {label}
        </h2>
      </div>
      <div className="flex flex-col gap-[20px] w-full max-md:gap-[16px]">
        {items.map((detail) => (
          <FaqAccordionItem
            key={detail.id}
            question={detail.question}
            answer={detail.answer}
          />
        ))}
      </div>
    </section>
  )
}

export default FaqCategorySection
