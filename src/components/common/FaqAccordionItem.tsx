import { useState } from 'react'
import { Icon } from '@/components'

type FaqAccordionItemProps = { question: string; answer: string }

const FaqAccordionItem = ({ question, answer }: FaqAccordionItemProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#ededed] pb-[20px] max-md:pb-[16px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-body1-medium text-gray-900 max-md:text-body2-medium">
          {question}
        </span>
        <Icon
          name="arrow"
          size={28}
          className={`shrink-0 text-gray-600 transition-transform max-md:size-6 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <p className="mt-[20px] w-full text-body3-regular text-gray-600 max-md:mt-[16px] max-md:text-tint-regular whitespace-pre-line">
          {answer}
        </p>
      )}
    </div>
  )
}

export default FaqAccordionItem
