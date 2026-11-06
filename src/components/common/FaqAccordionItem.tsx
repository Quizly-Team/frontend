import { useState } from 'react'
import { Icon } from '@/components'

type FaqAccordionItemProps = { question: string; answer: string }

const FaqAccordionItem = ({ question, answer }: FaqAccordionItemProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line-normal pb-[20px] max-md:pb-[16px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-2md-medium max-md:text-1md-medium text-gray-normal">
          {question}
        </span>
        <Icon
          name="arrow"
          size={28}
          className={`shrink-0 text-gray-alternative transition-transform max-md:size-6 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <p className="text-1rg-regular max-md:text-2sm-regular mt-[20px] w-full text-gray-alternative max-md:mt-[16px] whitespace-pre-line">
          {answer}
        </p>
      )}
    </div>
  )
}

export default FaqAccordionItem
