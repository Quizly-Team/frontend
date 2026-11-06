import { useState } from 'react'
import { FAQ_CATEGORIES, createAdminFaq, type FaqCategory } from '@/api/faq'

type FaqCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORY_OPTIONS = Object.entries(FAQ_CATEGORIES) as [
  FaqCategory,
  string,
][]

const FaqCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
}: FaqCreateModalProps) => {
  const [category, setCategory] = useState<FaqCategory | ''>('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setCategory('')
    setQuestion('')
    setAnswer('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!category) {
      alert('카테고리를 선택해주세요.')
      return
    }
    if (!question.trim()) {
      alert('질문을 입력해주세요.')
      return
    }
    if (!answer.trim()) {
      alert('답변을 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      await createAdminFaq({
        category,
        question: question.trim(),
        answer: answer.trim(),
      })
      alert('FAQ가 등록되었습니다.')
      resetForm()
      onSuccess()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'FAQ 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-static-black/40"
        onClick={handleClose}
      />
      <div className="relative bg-background-elevated rounded-lg w-full max-w-[520px] mx-4 p-6 md:p-8">
        <h2 className="text-2md-semibold text-gray-normal mb-6">FAQ 등록</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-2sm-medium block text-gray-neutral mb-2">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FaqCategory)}
              className="text-2sm-regular w-full h-[42px] rounded-sm border border-line-normal px-3 text-gray-normal outline-none focus:border-primary-normal"
            >
              <option value="">카테고리를 선택하세요</option>
              {CATEGORY_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-2sm-medium block text-gray-neutral mb-2">
              질문
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요"
              className="text-2sm-regular w-full h-[42px] rounded-sm border border-line-normal px-3 text-gray-normal outline-none focus:border-primary-normal"
            />
          </div>

          <div>
            <label className="text-2sm-medium block text-gray-neutral mb-2">
              답변
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요"
              className="text-2sm-regular w-full min-h-[120px] rounded-sm border border-line-normal px-3 py-2 text-gray-normal outline-none focus:border-primary-normal resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-2sm-regular px-5 py-3 rounded-sm border border-line-normal text-gray-neutral hover:bg-background-alternative transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-2sm-medium px-5 py-3 rounded-sm bg-primary-normal text-static-white hover:bg-primary-normal/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FaqCreateModal
