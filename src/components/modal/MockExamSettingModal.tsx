import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import Tooltip from '@/components/common/Tooltip';
import Icon from '@/components/common/Icon';
import { validateFileType } from '@/lib/pdfUtils';

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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    setSelectedCharacteristics((prev) => {
      const isRemoving = prev.includes(characteristic);
      const newCharacteristics = isRemoving
        ? prev.filter((c) => c !== characteristic)
        : [...prev, characteristic];

      // FIND_MATCH를 선택하면 FIND_CORRECT를 selectedTypes에서 제거
      if (characteristic === 'FIND_MATCH' && !isRemoving) {
        setSelectedTypes((prevTypes) => prevTypes.filter((t) => t !== 'FIND_CORRECT'));
      }

      return newCharacteristics;
    });
  }, []);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPlainText(e.target.value);
    if (e.target.value) {
      setFile(null);
      setImagePreviewUrl(null);
    }
  }, []);

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // 지원하는 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const typeValidation = validateFileType(uploadedFile, allowedTypes);

    if (!typeValidation.isValid) {
      alert(typeValidation.error);
      e.target.value = '';
      return;
    }

    setFile(uploadedFile);
    setPlainText(''); // 파일 업로드 시 텍스트 초기화
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
    // 객관식 문제가 선택되었는데 특성이 선택되지 않았으면 에러
    if (selectedTypes.includes('FIND_CORRECT') && selectedCharacteristics.length === 0) {
      alert('객관식 문제의 출제 특성을 선택해주세요.');
      return;
    }

    // FIND_MATCH가 선택되어 있으면 FIND_CORRECT를 제외
    let finalTypes = [...selectedTypes];
    if (selectedCharacteristics.includes('FIND_MATCH')) {
      finalTypes = finalTypes.filter((t) => t !== 'FIND_CORRECT');
    }
    
    // FIND_CORRECT는 selectedTypes에서 제거하고, selectedCharacteristics만 사용
    finalTypes = finalTypes.filter((t) => t !== 'FIND_CORRECT');
    
    // 최종적으로는 selectedCharacteristics만 전달 (다른 타입들도 포함)
    const allSelectedTypes = [...new Set([...finalTypes, ...selectedCharacteristics])];

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
    setImagePreviewUrl(null);
    setShowTooltip(false);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
    onClose();
  }, [onClose]);

  // 이미지 파일 업로드 시 미리보기 URL 생성
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setImagePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center max-md:items-end">
      {/* Dim background - 반투명으로 메인 페이지 보이게 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal - 모바일에서는 하단에서 올라오는 Bottom Sheet */}
      <div 
        className={`relative bg-white border border-[#ededed] rounded-[24px] max-md:rounded-t-[24px] max-md:rounded-b-none shadow-lg w-[520px] max-lg:w-[520px] max-md:w-full max-lg:mx-4 max-md:mx-0 max-h-[90vh] overflow-hidden flex flex-col ${
          selectedTypes.includes('FIND_CORRECT') 
            ? 'max-md:h-[758px]' 
            : 'max-md:h-[670px]'
        }`}
      >
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
        <div className="p-10 max-md:p-5 pb-3 overflow-y-auto flex-1">
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
              {EXAM_TYPES.map((type) => {
                // FIND_CORRECT의 경우 selectedTypes에 있거나 selectedCharacteristics에 객관식 관련 특성이 있으면 활성화
                const isActive = type.id === 'FIND_CORRECT'
                  ? selectedTypes.includes(type.id) || selectedCharacteristics.some(c => ['FIND_CORRECT', 'FIND_INCORRECT', 'FIND_MATCH'].includes(c))
                  : selectedTypes.includes(type.id);
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeToggle(type.id)}
                    className={
                      isActive
                        ? 'px-3 py-2 rounded-full border border-primary bg-primary text-white text-sm max-lg:text-sm max-md:text-sm font-normal leading-[1.4]'
                        : 'px-3 py-2 rounded-full border border-[#dedede] bg-white text-[#777777] text-sm max-lg:text-sm max-md:text-sm font-normal hover:border-gray-400 leading-[1.4]'
                    }
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: 출제 특성 선택 - 객관식 문제 선택 시에만 표시 */}
          {(selectedTypes.includes('FIND_CORRECT') || 
            selectedCharacteristics.some(c => ['FIND_CORRECT', 'FIND_INCORRECT', 'FIND_MATCH'].includes(c))) && (
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
                  <Tooltip className="w-[286px] max-lg:w-[310px] max-md:w-[286px]">
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
              <Icon name="upload" size={20} className="text-gray-600" />
              파일 업로드
            </button>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={file?.name || '업로드된 이미지'}
                className="w-[38px] h-[38px] object-cover rounded"
              />
            ) : (
              file && !imagePreviewUrl && (
                <span className="text-sm text-gray-600 underline leading-[1.4]">
                  {file.name}
                </span>
              )
            )}
          </div>
        </div>

        {/* File upload button - Mobile */}
        <div className="hidden max-md:block px-5 py-3 border-t border-[#ededed]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFileButtonClick}
              className="px-3 py-2 rounded-full border border-[#dedede] bg-white text-[#222222] text-sm font-normal hover:border-gray-400 flex items-center gap-1 leading-[1.4]"
            >
              <Icon name="upload" size={20} className="text-gray-600" />
              파일 업로드
            </button>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={file?.name || '업로드된 이미지'}
                className="w-[38px] h-[38px] object-cover rounded"
              />
            ) : (
              file && !imagePreviewUrl && (
                <span className="text-sm text-gray-600 underline leading-[1.4] truncate flex-1">
                  {file.name}
                </span>
              )
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
        <div className="hidden max-md:block px-5 py-4 border-t border-[#ededed]">
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
