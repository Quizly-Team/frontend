import type { ReactNode } from 'react'
import { Modal as MuiModal } from '@mui/material'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

const Modal = ({ isOpen, onClose, children, className = '' }: ModalProps) => {
  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div
        className={`bg-background-elevated rounded-xl pt-15 px-8 pb-8 w-[430px] min-h-[324px] mx-3 outline-none ${className}`}
      >
        {children}
      </div>
    </MuiModal>
  )
}

Modal.displayName = 'Modal'

type QuizResultModalProps = {
  isOpen: boolean
  onClose: () => void
  correctCount: number
  totalCount: number
  onViewAll: () => void
  onCreateMore: () => void
}

export const QuizResultModal = ({
  isOpen,
  onClose,
  correctCount,
  totalCount,
  onViewAll,
  onCreateMore,
}: QuizResultModalProps) => {
  const wrongCount = totalCount - correctCount

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="bg-background-elevated rounded-xl p-8 max-w-[450px] w-full mx-3 outline-none relative max-lg:max-w-[440px] max-lg:pt-10 max-lg:pb-10 max-md:max-w-[300px] max-md:h-[270px] max-md:pt-8 max-md:px-10 max-md:pb-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-7 h-7 flex items-center justify-center max-md:top-5 max-md:right-5 max-md:w-5 max-md:h-5"
          aria-label="닫기"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="max-md:w-5 max-md:h-5"
          >
            <path
              d="M21 7L7 21M7 7L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center">
          {/* Success Icon */}
          <div className="w-[100px] h-[100px] flex items-center justify-center max-lg:w-[92px] max-lg:h-[62px] max-md:w-[77px] max-md:h-[52px]">
            <img
              src="/icon/group.svg"
              alt="그룹 아이콘"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="max-md:!text-2sm-regular text-1rg-medium text-primary-normal mt-4 max-md:!mt-3">
            모든 문제를 다 풀었어요!
          </p>

          <div className="flex flex-col items-center mt-4 max-md:!mt-3">
            <h2 className="max-md:!text-2md-semibold text-2lg-bold text-gray-normal">
              문제 정답 결과
            </h2>
            <p className="max-md:!text-1rg-medium text-1md-medium text-gray-normal mt-1 max-md:!mt-1">
              {correctCount} / {totalCount}문제{' '}
              <span className="text-gray-alternative">
                (정답{correctCount}, 오답{wrongCount})
              </span>
            </p>
          </div>

          <div className="flex gap-4 mt-6 max-md:gap-3 max-md:!mt-4">
            <button
              onClick={onViewAll}
              className="max-md:!text-2sm-regular text-1rg-regular bg-primary-subtle text-primary-normal px-4 py-3 rounded-sm min-w-[128px] hover:bg-primary-subtle/80 transition-colors max-md:min-w-[93px] max-md:!px-2 max-md:!py-3"
            >
              문제 모아보기
            </button>
            <button
              onClick={onCreateMore}
              className="max-md:!text-2sm-regular text-1rg-regular bg-primary-normal text-static-white px-4 py-3 rounded-sm min-w-[128px] hover:bg-primary-normal/90 transition-colors max-md:min-w-[96px] max-md:!px-2 max-md:!py-3"
            >
              문제 더 만들기
            </button>
          </div>
        </div>
      </div>
    </MuiModal>
  )
}

QuizResultModal.displayName = 'QuizResultModal'

type QuizExitConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirmExit: () => void
}

export const QuizExitConfirmModal = ({
  isOpen,
  onClose,
  onConfirmExit,
}: QuizExitConfirmModalProps) => {
  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="bg-background-elevated rounded-xl px-6 py-8 w-[380px] mx-3 outline-none max-md:w-[300px]">
        {/* Content */}
        <div className="flex flex-col items-center gap-6">
          {/* Text Content */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-2sm-regular text-primary-normal text-center">
              아직 문제를 다 풀지 못했어요!
            </p>
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2md-semibold text-gray-normal text-center">
                멈추고 나가시겠어요?
              </h2>
              <p className="text-1rg-regular text-gray-alternative text-center">
                풀이가 종료되면 생성된 문제는
                <br />
                전부 오답처리 됩니다.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="text-2sm-regular bg-fill-alternative text-gray-normal px-2 py-3 rounded-xs w-[96px] hover:bg-interaction-neutral-pressed transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirmExit}
              className="text-2sm-regular bg-primary-normal text-static-white px-2 py-3 rounded-xs w-[96px] hover:bg-primary-normal/90 transition-colors"
            >
              나가기
            </button>
          </div>
        </div>
      </div>
    </MuiModal>
  )
}

QuizExitConfirmModal.displayName = 'QuizExitConfirmModal'

export default Modal
