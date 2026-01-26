import { useCallback, useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components";
import MockExamQuestion from "@/components/domain/MockExamQuestion";
import type { MockExamDetail } from "@/types/quiz";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExtendedCSSProperties extends CSSStyleDeclaration {
  webkitFontSmoothing?: string;
  fontSmooth?: string;
}

type LocationState = {
  mockExamDetailList: MockExamDetail[];
};

const CONTENT_WIDTH = 904; // 콘텐츠 원본 너비
const TABLET_MARGIN = 60; // 태블릿 좌우 마진 (768px ~ 1024px)
const MOBILE_MARGIN = 20; // 모바일 좌우 마진 (768px 미만)

const MockExamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);
  const [scaledWidth, setScaledWidth] = useState<number>(CONTENT_WIDTH);
  const [currentMargin, setCurrentMargin] = useState(TABLET_MARGIN);

  const mockExamList = state?.mockExamDetailList || [];

  // 화면 크기에 따라 스케일과 높이 계산
  useEffect(() => {
    const calculateScaleAndHeight = () => {
      const windowWidth = window.innerWidth;
      
      // 1024px 이상: 스케일 없음
      if (windowWidth >= 1024) {
        setScale(1);
        setScaledHeight(null);
        setScaledWidth(CONTENT_WIDTH);
        setCurrentMargin(TABLET_MARGIN);
        return;
      }
      
      // 768px ~ 1024px: 태블릿 (60px 마진)
      // 768px 미만: 모바일 (20px 마진)
      const margin = windowWidth >= 768 ? TABLET_MARGIN : MOBILE_MARGIN;
      setCurrentMargin(margin);
      
      // 마진을 제외한 영역에 맞게 스케일 계산
      const availableWidth = windowWidth - (margin * 2);
      const newScale = Math.min(availableWidth / CONTENT_WIDTH, 1);
      setScale(newScale);
      setScaledWidth(CONTENT_WIDTH * newScale);
      
      // 높이 계산
      if (innerContentRef.current) {
        const originalHeight = innerContentRef.current.offsetHeight;
        setScaledHeight(originalHeight * newScale);
      }
    };

    calculateScaleAndHeight();
    window.addEventListener('resize', calculateScaleAndHeight);
    
    // 이미지 로드 등을 위한 지연 재계산
    const timers = [
      setTimeout(calculateScaleAndHeight, 100),
      setTimeout(calculateScaleAndHeight, 300),
      setTimeout(calculateScaleAndHeight, 500),
    ];
    
    return () => {
      window.removeEventListener('resize', calculateScaleAndHeight);
      timers.forEach(clearTimeout);
    };
  }, [mockExamList]);

  const handleExportPDF = useCallback(async (type: 'question' | 'answer') => {
    const targetRef = type === 'question' ? questionRef : answerRef;
    if (!targetRef.current) return;

    try {
      const originalElement = targetRef.current;
      const clonedElement = originalElement.cloneNode(true) as HTMLElement;

      clonedElement.style.position = 'fixed';
      clonedElement.style.top = '-10000px';
      clonedElement.style.left = '-10000px';
      clonedElement.style.transform = 'none'; 
      clonedElement.style.width = '904px'; 
      clonedElement.style.margin = '0';
      clonedElement.style.zIndex = '-1';
      
      document.body.appendChild(clonedElement);

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 904,
        windowWidth: 904,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-pdf-target]');
          if (!clonedElement) return;

          const optionNumbers = clonedDoc.querySelectorAll('[data-option-number]');
          optionNumbers.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.display = 'flex';
            htmlEl.style.alignItems = 'center';
            htmlEl.style.justifyContent = 'center';

            const spanEl = htmlEl.querySelector('span') as HTMLElement;
            if (spanEl) {
              spanEl.style.display = 'flex';
              spanEl.style.alignItems = 'center';
              spanEl.style.justifyContent = 'center';
              spanEl.style.lineHeight = '1';
            }
          });

          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(el);

            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
              htmlEl.style.backgroundColor = '#30a10e';
            }
            if (computedStyle.color && computedStyle.color.includes('oklch')) {
              htmlEl.style.color = '#30a10e';
            }
            if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
              htmlEl.style.borderColor = '#30a10e';
            }

            const style = htmlEl.style as unknown as ExtendedCSSProperties;
            style.webkitFontSmoothing = 'antialiased';
            style.fontSmooth = 'always';
          });
        },
      });

      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 210;
      const pdfHeight = 297;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -pdfHeight * Math.ceil((imgHeight - heightLeft) / pdfHeight);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const fileName = type === 'question' ? '퀴즐리_모의고사_문제.pdf' : '퀴즐리_모의고사_해설.pdf';
      pdf.save(fileName);

    } catch (error) {
      const strayClone = document.body.lastElementChild as HTMLElement;
      if (strayClone && strayClone.style.top === '-10000px') {
        document.body.removeChild(strayClone);
      }
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }, []);

  if (!state || mockExamList.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-90px)] max-lg:h-[calc(100vh-72px)] max-md:h-[calc(100vh-46px)]">
          <div className="text-center">
            <p className="text-xl max-lg:text-2xl max-md:text-lg text-gray-900 mb-4">
              생성된 모의고사가 없습니다.
            </p>
            <button
              onClick={() => navigate("/")}
              className="h-11 max-lg:h-12 max-md:h-10 px-6 rounded bg-primary text-white text-base max-lg:text-lg max-md:text-base font-medium hover:bg-primary-dark"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-home max-md:pb-20">
      <Header />

      {/* 모바일 안내 문구 - 상단 */}
      <div className="hidden max-md:block pt-4 pb-3 px-5">
        <div className="bg-bg-home flex items-center gap-2 text-gray-600 text-sm font-normal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="#777777" strokeWidth="1" fill="none" />
            <text x="8" y="11.5" fontSize="12" fontWeight="bold" fill="#777777" textAnchor="middle">
              i
            </text>
          </svg>
          실전 모의고사는 PC 최적화되어있습니다.
        </div>
      </div>

      {/* 상단 버튼 영역 - 웹/태블릿만 */}
      <div 
        className="flex justify-center pt-[60px] max-lg:pt-[50px] max-md:hidden pb-6"
        style={{ padding: `60px ${currentMargin}px 24px` }}
      >
        <div 
          className="flex justify-end gap-3"
          style={{ width: `${scaledWidth}px` }}
        >
          <button
            onClick={() => handleExportPDF("question")}
            className="px-3 py-3 rounded-md border border-[#dedede] bg-white text-[#222222] text-sm font-normal hover:border-gray-400 flex items-center gap-1"
          >
            <img
              src="/icon/icn_book.svg"
              alt="문제 내보내기"
              width={20}
              height={20}
            />
            문제 내보내기
          </button>
          <button
            onClick={() => handleExportPDF("answer")}
            className="px-3 py-3 rounded-md border border-[#dedede] bg-white text-[#222222] text-sm font-normal hover:border-gray-400 flex items-center gap-1"
          >
            <img
              src="/icon/icn_memo.svg"
              alt="해설 내보내기"
              width={20}
              height={20}
            />
            해설 내보내기
          </button>
        </div>
      </div>

      {/* 모의고사 컨텐츠 */}
      <div 
        className="flex justify-center pb-20 max-md:pb-4"
        style={{ paddingLeft: `${currentMargin}px`, paddingRight: `${currentMargin}px` }}
      >
        {/* 스케일 래퍼 - 스케일된 크기로 고정하여 중앙 정렬 */}
        <div 
          className="overflow-hidden"
          style={{ 
            width: `${scaledWidth}px`,
            height: scaledHeight && scale < 1 ? `${scaledHeight}px` : undefined 
          }}
        >
          {/* 스케일 컨테이너 */}
          <div 
            className="origin-top-left"
            style={{ transform: `scale(${scale})` }}
          >
            {/* 웹 크기 고정 (904px) */}
            <div 
              ref={innerContentRef}
              className="w-[904px] bg-white border border-[#dedede] rounded-2xl shadow-[4px_4px_12px_0px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              {/* 문제 섹션 */}
              <div ref={questionRef} data-pdf-target="question">
                {/* 헤더 이미지 - 상단 */}
                <div className="relative w-full pt-[60px] px-[40px] text-center pb-5">
                  <img
                    src="/icon/mock_exam_header.svg"
                    alt="실전 모의고사 영역"
                    className="w-[502px] h-[131px] mx-auto"
                  />
                </div>

                {/* 헤더와 문제 사이 구분선 및 세로 구분선 컨테이너 */}
                <div className="relative">
                  {/* 가로 구분선 */}
                  <div className="h-[2px] bg-[#222222] mx-[40px]" />
                  
                  {/* 문제 목록 영역 */}
                  <div className="relative flex">
                    {/* 왼쪽 열 */}
                    <div className="w-1/2">
                      {/* 왼쪽 설명 이미지 */}
                      <div className="relative pl-[40px] pr-0">
                        <img
                          src="/icon/mock_exam_ description.svg"
                          alt="수험생 정보 및 유의사항"
                          className="w-full h-auto object-contain"
                        />
                      </div>

                      {/* 왼쪽 문제들 */}
                      <div className="pl-[52px] pr-[40px] pb-10">
                        {mockExamList
                          .slice(0, Math.ceil(mockExamList.length / 2))
                          .map((question, index) => (
                            <MockExamQuestion
                              key={index}
                              question={question}
                              questionNumber={index + 1}
                              showAnswer={false}
                            />
                          ))}
                      </div>
                    </div>

                    {/* 세로 구분선 - 가로 구분선과 같은 위치에서 시작 */}
                    <div className="absolute left-1/2 top-0 w-px bg-[#222222] -translate-x-1/2 bottom-0" />

                    {/* 오른쪽 열 */}
                    <div className="w-1/2 pl-3 pr-[40px] pb-10">
                      {mockExamList
                        .slice(Math.ceil(mockExamList.length / 2))
                        .map((question, index) => (
                          <MockExamQuestion
                            key={Math.ceil(mockExamList.length / 2) + index}
                            question={question}
                            questionNumber={Math.ceil(mockExamList.length / 2) + index + 1}
                            showAnswer={false}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 해설 섹션 */}
              <div
                ref={answerRef}
                data-pdf-target="answer"
                className="border-t-4 border-gray-300"
              >
                {/* 헤더 이미지 */}
                <div className="relative w-full pt-[60px] px-[40px] text-center pb-5">
                  <img
                    src="/icon/mock_ commentary_header.svg"
                    alt="실전 모의고사 해설 및 답안"
                    className="w-[514px] h-[82px] mx-auto"
                  />
                </div>

                {/* 헤더와 해설 사이 구분선 및 세로 구분선 컨테이너 */}
                <div className="relative">
                  {/* 가로 구분선 */}
                  <div className="h-[2px] bg-[#222222] mx-[40px]" />
                  
                  {/* 해설 목록 - 2열 레이아웃 */}
                  <div className="relative flex">
                    {/* 왼쪽 열 */}
                    <div className="w-1/2 pl-[52px] pr-[40px] pb-10">
                      {mockExamList
                        .slice(0, Math.ceil(mockExamList.length / 2))
                        .map((question, index) => (
                          <MockExamQuestion
                            key={`answer-${index}`}
                            question={question}
                            questionNumber={index + 1}
                            showAnswer={true}
                          />
                        ))}
                    </div>

                    {/* 세로 구분선 - 가로 구분선과 같은 위치에서 시작 */}
                    <div className="absolute left-1/2 top-0 w-px bg-[#222222] -translate-x-1/2 bottom-0" />

                    {/* 오른쪽 열 */}
                    <div className="w-1/2 pl-3 pr-[40px] pb-10">
                      {mockExamList
                        .slice(Math.ceil(mockExamList.length / 2))
                        .map((question, index) => (
                          <MockExamQuestion
                            key={`answer-${Math.ceil(mockExamList.length / 2) + index}`}
                            question={question}
                            questionNumber={Math.ceil(mockExamList.length / 2) + index + 1}
                            showAnswer={true}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 고정 버튼 */}
      <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-white border-t border-[#dedede] z-50">
        <div className="flex gap-3 px-5 py-3">
          <button
            onClick={() => handleExportPDF("question")}
            className="flex-1 h-[52px] rounded-lg border border-[#dedede] bg-white text-[#222222] text-base font-medium hover:border-gray-400 flex items-center justify-center gap-2"
          >
            <img
              src="/icon/icn_book.svg"
              alt="문제 내보내기"
              width={20}
              height={20}
            />
            문제 내보내기
          </button>
          <button
            onClick={() => handleExportPDF("answer")}
            className="flex-1 h-[52px] rounded-lg border border-[#dedede] bg-white text-[#222222] text-base font-medium hover:border-gray-400 flex items-center justify-center gap-2"
          >
            <img
              src="/icon/icn_memo.svg"
              alt="해설 내보내기"
              width={20}
              height={20}
            />
            해설 내보내기
          </button>
        </div>
      </div>
    </div>
  );
};

MockExamPage.displayName = "MockExamPage";

export default MockExamPage;