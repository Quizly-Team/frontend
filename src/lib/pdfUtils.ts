import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * PDF 파일의 페이지 수를 확인합니다.
 * @param file PDF 파일
 * @returns 페이지 수
 * @throws PDF를 읽을 수 없는 경우 에러 발생
 */
export const getPdfPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
};

/**
 * PDF 파일의 페이지 수가 제한 내에 있는지 확인합니다.
 * @param file PDF 파일
 * @param maxPages 최대 페이지 수 (기본값: 10)
 * @returns 유효성 검사 결과 { isValid: boolean, pageCount: number, error?: string }
 */
export const validatePdfPageCount = async (
  file: File,
  maxPages: number = 10
): Promise<{ isValid: boolean; pageCount: number; error?: string }> => {
  try {
    const pageCount = await getPdfPageCount(file);

    if (pageCount > maxPages) {
      return {
        isValid: false,
        pageCount,
        error: `PDF는 ${maxPages}장까지만 업로드 가능합니다.`,
      };
    }

    return {
      isValid: true,
      pageCount,
    };
  } catch (error) {
    console.error('PDF 페이지 수 확인 오류:', error);
    return {
      isValid: false,
      pageCount: 0,
      error: 'PDF 파일을 읽을 수 없습니다.',
    };
  }
};

/**
 * 파일 형식을 확인합니다.
 * @param file 파일
 * @param allowedTypes 허용된 MIME 타입 배열
 * @returns 유효성 검사 결과 { isValid: boolean, error?: string }
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    const extensions = allowedTypes
      .map((type) => {
        if (type === 'image/jpeg' || type === 'image/jpg') return '*.jpg';
        if (type === 'image/png') return '*.png';
        if (type === 'application/pdf') return '*.pdf';
        return '';
      })
      .filter(Boolean)
      .join(', ');

    return {
      isValid: false,
      error: `지원하지 않는 파일 형식입니다.\n${extensions} 파일만 업로드 가능합니다.`,
    };
  }

  return { isValid: true };
};
