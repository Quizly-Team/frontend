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
    <section className="w-full bg-background-elevated border border-line-normal rounded-lg p-8 flex flex-col gap-8 max-md:p-5">
      <div className="flex items-center gap-3 max-md:gap-2">
        <div className="size-10 max-md:size-8 rounded-sm bg-primary-subtle flex items-center justify-center shrink-0">
          <Icon
            name={CATEGORY_ICON[category] ?? FALLBACK_ICON}
            size={24}
            className="max-md:size-5"
          />
        </div>
        <h2 className="text-2lg-bold max-md:text-2md-medium text-gray-normal">
          {label}
        </h2>
      </div>
      <div className="flex flex-col gap-5 w-full max-md:gap-4">
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
