import { Modal as MuiModal } from '@mui/material';
import { useCallback, useState } from 'react';
import { Icon, Tooltip } from '@/components';

type QuizType = 'multiple' | 'ox';

type QuizCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuizType: (type: QuizType) => void;
  isLoggedIn?: boolean;
};

const QuizCreateModal = ({
  isOpen,
  onClose,
  onSelectQuizType,
  isLoggedIn = false,
}: QuizCreateModalProps) => {
  const [showMultipleTooltip, setShowMultipleTooltip] = useState(false);

  const handleMultipleChoice = useCallback(() => {
    if (!isLoggedIn) return;
    onSelectQuizType('multiple');
    onClose();
  }, [isLoggedIn, onSelectQuizType, onClose]);

  const handleOXQuiz = useCallback(() => {
    onSelectQuizType('ox');
    onClose();
  }, [onSelectQuizType, onClose]);

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="outline-none w-full max-w-[1024px] max-lg:max-w-[904px] max-md:max-w-[335px] px-6 max-lg:px-15 max-md:px-l">
        {/* Web/Tablet 레이아웃 */}
        <div className="max-md:hidden flex gap-3 justify-center">
          {/* 객관식 문제 카드 */}
          <div
            className="relative"
            onMouseEnter={() => !isLoggedIn && setShowMultipleTooltip(true)}
            onMouseLeave={() => setShowMultipleTooltip(false)}
          >
            <button
              onClick={handleMultipleChoice}
              disabled={!isLoggedIn}
              className="bg-white rounded-[24px] w-[420px] max-lg:w-[392px] h-[306px] max-lg:h-[286px] flex flex-col items-center justify-center gap-6 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed relative flex-shrink-0"
            >
              {/* 비회원 비활성화 오버레이 */}
              {!isLoggedIn && (
                <div className="absolute inset-0 bg-black/30 rounded-[24px] z-10" />
              )}

              {/* 아이콘 */}
              <div className="relative">
                <Icon name="light" size={60} />
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-header3-bold text-gray-900">
                  객관식 문제 만들기
                </h3>
                <p className="text-body3-regular text-gray-600 text-center whitespace-pre-wrap">
                  {'사지선다형의 객관식 문제를\n만들어 드립니다.'}
                </p>
              </div>
            </button>

            {/* 툴팁 */}
            {showMultipleTooltip && !isLoggedIn && (
              <Tooltip position="bottom">
                <div>객관식 문제 만들기는</div>
                <div>회원일 경우만 가능합니다.</div>
              </Tooltip>
            )}
          </div>

          {/* OX 문제 카드 */}
          <button
            onClick={handleOXQuiz}
            className="bg-white rounded-[24px] w-[420px] max-lg:w-[392px] h-[306px] max-lg:h-[286px] flex flex-col items-center justify-center gap-6 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            {/* 아이콘 */}
            <div className="flex gap-2">
              <Icon name="correct" size={60} />
              <Icon name="error" size={60} />
            </div>

            {/* 텍스트 */}
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-header3-bold text-gray-900">
                OX 문제 만들기
              </h3>
              <p className="text-body3-regular text-gray-600 text-center whitespace-pre-wrap">
                {'간단한 OX 형식의 문제를\n만들어 드립니다.'}
              </p>
            </div>
          </button>
        </div>

        {/* Mobile 레이아웃 */}
        <div className="hidden max-md:flex flex-col gap-3 items-center">
          {/* 객관식 문제 카드 */}
          <button
            onClick={handleMultipleChoice}
            disabled={!isLoggedIn}
            className="bg-white rounded-[24px] w-[240px] h-[194px] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed relative"
          >
            {/* 비회원 비활성화 오버레이 */}
            {!isLoggedIn && (
              <div className="absolute inset-0 bg-black/30 rounded-[24px] z-10" />
            )}

            {/* 아이콘 */}
            <div className="relative">
              <Icon name="light" size={42} />
            </div>

            {/* 텍스트 */}
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-body1-medium text-gray-900">
                객관식 문제 만들기
              </h3>
              <p className="text-tint-regular text-gray-600 text-center whitespace-pre-wrap">
                {'사지선다형의 객관식 문제를\n만들어 드립니다.'}
              </p>
            </div>
          </button>

          {/* OX 문제 카드 */}
          <button
            onClick={handleOXQuiz}
            className="bg-white rounded-[24px] w-[240px] h-[194px] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            {/* 아이콘 */}
            <div className="flex gap-2">
              <Icon name="correct" size={42} />
              <Icon name="error" size={42} />
            </div>

            {/* 텍스트 */}
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-body1-medium text-gray-900">
                OX 문제 만들기
              </h3>
              <p className="text-tint-regular text-gray-600 text-center whitespace-pre-wrap">
                {'간단한 OX 형식의 문제를\n만들어 드립니다.'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </MuiModal>
  );
};

QuizCreateModal.displayName = 'QuizCreateModal';

export default QuizCreateModal;
