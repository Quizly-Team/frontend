import { useState, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import Tooltip from '@/components/common/Tooltip';

type MockExamType = 'TRUE_FALSE' | 'FIND_CORRECT' | 'SHORT_ANSWER' | 'ESSAY';
type MockExamCharacteristic = 'FIND_CORRECT' | 'FIND_INCORRECT' | 'FIND_MATCH';

type MockExamSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MockExamSettingData) => void;
};

export type MockExamSettingData = {
  plainText?: string;
  file?: File;
  mockExamTypeList: string[];
};

const EXAM_TYPES = [
  { id: 'TRUE_FALSE', label: 'OX 퀴즈' },
  { id: 'FIND_CORRECT', label: '객관식 문제' },
  { id: 'SHORT_ANSWER', label: '주관식 문제' },
  { id: 'ESSAY', label: '서술형 문제' },
] as const;

const EXAM_CHARACTERISTICS = [
  { id: 'FIND_CORRECT', label: '정답 찾기' },
  { id: 'FIND_INCORRECT', label: '옳지 않은 것 찾기' },
  { id: 'FIND_MATCH', label: '보기 문항 찾기' },
] as const;

const MockExamSettingModal = ({ isOpen, onClose, onSubmit }: MockExamSettingModalProps) => {
  const [selectedTypes, setSelectedTypes] = useState<MockExamType[]>([]);
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<MockExamCharacteristic[]>([]);
  const [plainText, setPlainText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeToggle = useCallback((type: MockExamType) => {
    setSelectedTypes((prev) => {
      const isRemoving = prev.includes(type);

      // 객관식 문제를 선택 해제하면 특성 선택도 초기화
      if (isRemoving && type === 'FIND_CORRECT') {
        setSelectedCharacteristics([]);
      }

      return isRemoving ? prev.filter((t) => t !== type) : [...prev, type];
    });
  }, []);

  const handleCharacteristicToggle = useCallback((characteristic: MockExamCharacteristic) => {
    setSelectedCharacteristics((prev) =>
      prev.includes(characteristic)
        ? prev.filter((c) => c !== characteristic)
        : [...prev, characteristic]
    );
  }, []);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPlainText(e.target.value);
    if (e.target.value) {
      setFile(null); // 텍스트 입력 시 파일 초기화
    }
  }, []);

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setPlainText(''); // 파일 업로드 시 텍스트 초기화
    }
  }, []);

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    setShowTooltip(true);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const allSelectedTypes = [...new Set([...selectedTypes, ...selectedCharacteristics])];

    if (allSelectedTypes.length === 0) {
      alert('최소 1개 이상의 문제 유형을 선택해주세요.');
      return;
    }

    // 파일과 텍스트 둘 다 없는 경우
    if (!file && !plainText.trim()) {
      alert('문제 내용을 입력하거나 파일을 업로드해주세요.');
      return;
    }

    // 파일이 있는 경우 파일로 전송
    if (file) {
      onSubmit({
        file,
        mockExamTypeList: allSelectedTypes,
      });
    } else {
      // 텍스트만 있는 경우
      onSubmit({
        plainText: plainText.trim(),
        mockExamTypeList: allSelectedTypes,
      });
    }
  }, [selectedTypes, selectedCharacteristics, plainText, file, onSubmit]);

  const handleClose = useCallback(() => {
    setSelectedTypes([]);
    setSelectedCharacteristics([]);
    setPlainText('');
    setFile(null);
    setShowTooltip(false);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center max-md:items-end">
      {/* Dim background - 반투명으로 메인 페이지 보이게 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal - 모바일에서는 하단에서 올라오는 Bottom Sheet */}
      <div className="relative bg-white border border-[#ededed] rounded-[24px] max-md:rounded-t-[24px] max-md:rounded-b-none shadow-lg w-[520px] max-lg:w-[520px] max-md:w-full max-md:max-h-[75vh] max-lg:mx-4 max-md:mx-0 max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-10 right-10 max-md:hidden w-7 h-7 flex items-center justify-center"
          aria-label="닫기"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M7 7L21 21M7 21L21 7"
              stroke="#666666"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Mobile header */}
        <div className="hidden max-md:flex items-center justify-center h-16 border-b border-[#ededed]">
          <h2 className="text-lg font-semibold text-[#222222]">실전 모의고사 맞춤 설정</h2>
        </div>

        {/* Content */}
        <div className="p-10 max-md:p-5 pb-5 overflow-y-auto max-h-[calc(90vh-80px)] max-md:max-h-[calc(75vh-64px-106px)]">
          {/* Title - Desktop/Tablet only */}
          <div className="mb-6 max-lg:mb-6 max-md:hidden">
            <h2 className="text-lg max-lg:text-xl font-medium text-[#222222] mb-1 leading-[1.4]">
              실전 모의고사 맞춤 설정
            </h2>
            <p className="text-sm max-lg:text-base text-[#777777] leading-[1.4]">
              필요한 유형에 맞춰 모의고사 문제를 받으세요
            </p>
          </div>

          {/* Mobile subtitle */}
          <p className="hidden max-md:block text-base text-[#777777] mb-6">
            필요한 유형에 맞춰 모의고사 문제를 받으세요
          </p>

          {/* Question 1: 문제 유형 선택 */}
          <div className="mb-6 max-lg:mb-6 max-md:mb-[30px]">
            <h3 className="text-base max-lg:text-lg max-md:text-base font-medium text-[#222222] mb-3 max-lg:mb-3 max-md:mb-3 leading-[1.4]">
              어떤 유형의 문제를 만드시겠어요?(복수 선택 가능)
            </h3>
            <div className="flex flex-wrap gap-[5px] max-md:gap-1">
              {EXAM_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeToggle(type.id)}
                  className={
                    selectedTypes.includes(type.id)
                      ? 'px-3 py-2 rounded-full border border-primary bg-primary text-white text-sm max-lg:text-sm max-md:text-sm font-normal leading-[1.4]'
                      : 'px-3 py-2 rounded-full border border-[#dedede] bg-white text-[#777777] text-sm max-lg:text-sm max-md:text-sm font-normal hover:border-gray-400 leading-[1.4]'
                  }
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: 출제 특성 선택 - 객관식 문제 선택 시에만 표시 */}
          {selectedTypes.includes('FIND_CORRECT') && (
            <div className="mb-6 max-lg:mb-6 max-md:mb-[30px]">
              <h3 className="text-base max-lg:text-lg max-md:text-base font-medium text-[#222222] mb-3 max-lg:mb-3 max-md:mb-3 leading-[1.4]">
                문항을 어떤 특성으로 출제할까요?(복수 선택 가능)
              </h3>
              <div className="flex flex-wrap gap-1 max-md:gap-1">
                {EXAM_CHARACTERISTICS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleCharacteristicToggle(char.id)}
                    className={
                      selectedCharacteristics.includes(char.id)
                        ? 'px-3 py-2 rounded-full border border-primary bg-primary text-white text-sm max-lg:text-sm max-md:text-sm font-normal leading-[1.4]'
                        : 'px-3 py-2 rounded-full border border-[#dedede] bg-white text-[#777777] text-sm max-lg:text-sm max-md:text-sm font-normal hover:border-gray-400 leading-[1.4]'
                    }
                  >
                    {char.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="mb-3 max-lg:mb-3 max-md:mb-[30px]">
            <div className="relative mb-3 max-lg:mb-3 max-md:mb-3">
              <h3 className="text-base max-lg:text-lg max-md:text-base font-medium text-[#222222] inline leading-[1.4]">
                정리한 필기 내용을 기재해주세요
              </h3>
              <div
                className="relative inline-flex items-center justify-center w-4 h-4 max-lg:w-4 max-lg:h-4 ml-1 align-middle cursor-pointer"
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                aria-label="도움말"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="7" stroke="#999999" strokeWidth="1" fill="none" />
                  <text
                    x="8"
                    y="12"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#999999"
                    textAnchor="middle"
                  >
                    !
                  </text>
                </svg>
                {showTooltip && (
                  <Tooltip position="top" className="w-[286px] max-lg:w-[310px] max-md:w-[286px]">
                    <p className="mb-0">최소 300자 이상의 내용을 작성해주시면</p>
                    <p className="mb-0">중복 없이 문제를 만들 수 있습니다.</p>
                    <p>내용 또는 파일 업로드 둘 중 하나만 선택 가능합니다.</p>
                  </Tooltip>
                )}
              </div>
            </div>
            <textarea
              value={plainText}
              onChange={handleTextChange}
              placeholder="필기 내용을 자유롭게 기재해주세요"
              disabled={!!file}
              className="w-full h-[140px] max-lg:h-[140px] max-md:h-[140px] px-3 py-3 border border-[#dedede] rounded-md text-sm max-lg:text-sm max-md:text-sm text-[#222222] placeholder:text-[#9e9e9e] resize-none focus:outline-none focus:border-primary leading-[1.4] disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* File upload button - Web/Tablet */}
        <div className="max-md:hidden px-10 pb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleFileButtonClick}
              className="px-3 py-2 rounded-full border border-[#dedede] bg-white text-[#222222] text-sm max-lg:text-sm font-normal hover:border-gray-400 flex items-center gap-1 leading-[1.4]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 15V5M5 10H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              파일 업로드
            </button>
            {file && (
              <span className="text-sm text-[#222222] leading-[1.4]">
                {file.name}
              </span>
            )}
          </div>
        </div>

        {/* File upload button - Mobile */}
        <div className="hidden max-md:block px-5 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFileButtonClick}
              className="px-3 py-2 rounded-full border border-[#dedede] bg-white text-[#222222] text-sm font-normal hover:border-gray-400 flex items-center gap-1 leading-[1.4]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 15V5M5 10H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              파일 업로드
            </button>
            {file && (
              <span className="text-sm text-[#222222] leading-[1.4] truncate flex-1">
                {file.name}
              </span>
            )}
          </div>
        </div>

        {/* Bottom button - Desktop/Tablet */}
        <div className="max-md:hidden px-10 pb-10 max-lg:px-10 max-lg:pb-10">
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-8 py-2 rounded-md bg-primary text-white text-sm max-lg:text-sm font-normal hover:bg-primary-dark leading-[1.4]"
            >
              저장하기
            </button>
          </div>
        </div>

        {/* Bottom button - Mobile */}
        <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white border-t border-[#ededed] p-5 pb-[34px]">
          <button
            onClick={handleSubmit}
            className="w-full h-[52px] rounded-lg bg-primary text-white text-base font-medium hover:bg-primary-dark"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

MockExamSettingModal.displayName = 'MockExamSettingModal';

export default MockExamSettingModal;
