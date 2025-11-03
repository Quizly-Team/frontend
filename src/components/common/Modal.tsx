import { Modal as MuiModal } from '@mui/material';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="bg-white rounded-[24px] p-8 max-w-[450px] w-full mx-m outline-none">
        {children}
      </div>
    </MuiModal>
  );
};

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
      <div className="bg-white rounded-[24px] p-8 max-w-[450px] w-full mx-m outline-none relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-7 h-7 flex items-center justify-center"
          aria-label="닫기"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
        <div className="flex flex-col items-center gap-4">
          {/* Success Icon */}
          <div className="w-[100px] h-[100px] flex items-center justify-center">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="40" fill="#30a10e" opacity="0.1" />
              <path
                d="M35 50L45 60L65 40"
                stroke="#30a10e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-body3-medium text-primary">
            모든 문제를 다 풀었어요!
          </p>

          <div className="flex flex-col items-center gap-4">
            <h2 className="text-header3-bold text-gray-900">문제 정답 결과</h2>
            <p className="text-body2-medium text-gray-900">
              {correctCount} / {totalCount}문제{' '}
              <span className="text-gray-600">
                (정답{correctCount}, 오답{wrongCount})
              </span>
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onViewAll}
              className="bg-secondary text-primary text-body3-regular px-4 py-3 rounded-[6px] min-w-[128px]"
            >
              문제 모아보기
            </button>
            <button
              onClick={onCreateMore}
              className="bg-primary text-white text-body3-regular px-4 py-3 rounded-[6px] min-w-[128px]"
            >
              문제 더 만들기
            </button>
          </div>
        </div>
      </div>
    </MuiModal>
  );
};

export default Modal;
