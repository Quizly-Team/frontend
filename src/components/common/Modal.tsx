import { Modal as MuiModal } from '@mui/material';
import type { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const Modal = ({ isOpen, onClose, children, className = '' }: ModalProps) => {
  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className={`bg-white rounded-[24px] pt-[60px] px-8 pb-8 w-[430px] min-h-[324px] mx-m outline-none ${className}`}>
        {children}
      </div>
    </MuiModal>
  );
};

Modal.displayName = 'Modal';

type QuizResultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  correctCount: number;
  totalCount: number;
  onViewAll: () => void;
  onCreateMore: () => void;
};

export const QuizResultModal = ({
  isOpen,
  onClose,
  correctCount,
  totalCount,
  onViewAll,
  onCreateMore,
}: QuizResultModalProps) => {
  const wrongCount = totalCount - correctCount;

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="bg-white rounded-[24px] p-8 max-w-[450px] w-full mx-m outline-none relative max-lg:max-w-[440px] max-lg:pt-10 max-lg:pb-10 max-md:max-w-[300px] max-md:h-[270px] max-md:pt-[30px] max-md:px-[38px] max-md:pb-[30px]">
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

          <p className="text-body3-medium text-primary mt-4 max-md:!text-[14px] max-md:!font-normal max-md:!leading-[1.4] max-md:!mt-3">
            모든 문제를 다 풀었어요!
          </p>

          <div className="flex flex-col items-center mt-4 max-md:!mt-3">
            <h2 className="text-header3-bold text-gray-900 max-md:!text-[20px] max-md:!font-bold max-md:!leading-[1.4]">문제 정답 결과</h2>
            <p className="text-body2-medium text-gray-900 mt-1 max-md:!text-[16px] max-md:!font-medium max-md:!leading-[1.4] max-md:!mt-1">
              {correctCount} / {totalCount}문제{' '}
              <span className="text-gray-600">
                (정답{correctCount}, 오답{wrongCount})
              </span>
            </p>
          </div>

          <div className="flex gap-4 mt-6 max-md:gap-3 max-md:!mt-4">
            <button
              onClick={onViewAll}
              className="bg-secondary text-primary text-body3-regular px-4 py-3 rounded-[6px] min-w-[128px] hover:bg-secondary/80 transition-colors max-md:min-w-[93px] max-md:!px-2 max-md:!py-[10px] max-md:!text-[14px] max-md:!font-normal max-md:!leading-[1.4]"
            >
              문제 모아보기
            </button>
            <button
              onClick={onCreateMore}
              className="bg-primary text-white text-body3-regular px-4 py-3 rounded-[6px] min-w-[128px] hover:bg-primary/90 transition-colors max-md:min-w-[96px] max-md:!px-2 max-md:!py-[10px] max-md:!text-[14px] max-md:!font-normal max-md:!leading-[1.4]"
            >
              문제 더 만들기
            </button>
          </div>
        </div>
      </div>
    </MuiModal>
  );
};

QuizResultModal.displayName = 'QuizResultModal';

type QuizExitConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
};

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
      <div className="bg-white rounded-[24px] px-6 py-[30px] w-[380px] mx-m outline-none max-md:w-[300px]">
        {/* Content */}
        <div className="flex flex-col items-center gap-6">
          {/* Text Content */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-tint-regular text-primary text-center">
              아직 문제를 다 풀지 못했어요!
            </p>
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-[20px] font-bold text-gray-900 leading-[1.4] text-center">
                멈추고 나가시겠어요?
              </h2>
              <p className="text-body3-regular text-gray-600 text-center">
                풀이가 종료되면 생성된 문제는<br />전부 오답처리 됩니다.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-900 text-tint-regular px-2 py-[10px] rounded-[4px] w-[96px] hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirmExit}
              className="bg-primary text-white text-tint-regular px-2 py-[10px] rounded-[4px] w-[96px] hover:bg-primary/90 transition-colors"
            >
              나가기
            </button>
          </div>
        </div>
      </div>
    </MuiModal>
  );
};

QuizExitConfirmModal.displayName = 'QuizExitConfirmModal';

export default Modal;
