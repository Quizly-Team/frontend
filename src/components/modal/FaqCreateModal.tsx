import { useState } from 'react';
import { FAQ_CATEGORIES, createAdminFaq, type FaqCategory } from '@/api/faq';

type FaqCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const CATEGORY_OPTIONS = Object.entries(FAQ_CATEGORIES) as [FaqCategory, string][];

const FaqCreateModal = ({ isOpen, onClose, onSuccess }: FaqCreateModalProps) => {
  const [category, setCategory] = useState<FaqCategory | ''>('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCategory('');
    setQuestion('');
    setAnswer('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!category) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }
    if (!answer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createAdminFaq({ category, question: question.trim(), answer: answer.trim() });
      alert('FAQ가 등록되었습니다.');
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'FAQ 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-[520px] mx-4 p-6 md:p-8">
        <h2 className="text-[20px] font-bold text-gray-900 mb-6">FAQ 등록</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-1.5">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FaqCategory)}
              className="w-full h-[42px] rounded-lg border border-gray-300 px-3 text-[14px] text-gray-900 outline-none focus:border-primary"
            >
              <option value="">카테고리를 선택하세요</option>
              {CATEGORY_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-1.5">질문</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요"
              className="w-full h-[42px] rounded-lg border border-gray-300 px-3 text-[14px] text-gray-900 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-1.5">답변</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요"
              className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-primary resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-[14px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqCreateModal;
