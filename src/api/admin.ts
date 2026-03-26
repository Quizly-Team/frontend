import { authenticatedFetch } from './account';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type InquiryStatus = 'WAITING' | 'COMPLETED';

type PaginationInfo = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
};

type GetAdminInquiriesParams = {
  page?: number;
  status?: InquiryStatus;
};

type GetAdminInquiriesResponse = {
  inquiryList: AdminInquiryRaw[];
  pagination: PaginationInfo;
};

export type AdminInquiryRaw = {
  inquiryId?: number;
  id?: number;
  inquiryID?: number;
  title?: string;
  subject?: string;
  inquiryTitle?: string;
  writer?: string;
  writerName?: string;
  writerId?: number;
  name?: string;
  nickName?: string;
  nickname?: string;
  userNickname?: string;
  userNickName?: string;
  memberNickname?: string;
  memberName?: string;
  username?: string;
  userName?: string;
  userId?: number;
  user?: {
    id?: number;
    name?: string;
    nickName?: string;
    nickname?: string;
  };
  createdAt?: string;
  createdDate?: string;
  inquiryDate?: string;
  repliedAt?: string;
  status?: string;
  inquiryStatus?: string;
  content?: string;
  question?: string;
  inquiryContent?: string;
  answer?: string;
  answerContent?: string;
  reply?: string;
};

type InquiriesResponseShape =
  | AdminInquiryRaw[]
  | {
      inquiries?: AdminInquiryRaw[];
      inquiryList?: AdminInquiryRaw[];
      content?: AdminInquiryRaw[];
      data?:
        | AdminInquiryRaw[]
        | {
            inquiries?: AdminInquiryRaw[];
            inquiryList?: AdminInquiryRaw[];
            content?: AdminInquiryRaw[];
          };
    };

const extractInquiryArray = (payload: InquiriesResponseShape): AdminInquiryRaw[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.inquiries)) {
    return payload.inquiries;
  }

  if (Array.isArray(payload.inquiryList)) {
    return payload.inquiryList;
  }

  if (Array.isArray(payload.content)) {
    return payload.content;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && !Array.isArray(payload.data)) {
    if (Array.isArray(payload.data.inquiries)) {
      return payload.data.inquiries;
    }
    if (Array.isArray(payload.data.inquiryList)) {
      return payload.data.inquiryList;
    }
    if (Array.isArray(payload.data.content)) {
      return payload.data.content;
    }
  }

  return [];
};

/**
 * 관리자 문의 목록 조회
 */
export const getAdminInquiries = async (
  params?: GetAdminInquiriesParams
): Promise<GetAdminInquiriesResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set('page', String(params.page));
  }

  if (params?.status) {
    searchParams.set('status', params.status);
  }

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/admin/inquiries${queryString ? `?${queryString}` : ''}`;

  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `문의 목록 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  const payload = await response.json();
  const inquiryList = extractInquiryArray(payload as InquiriesResponseShape);
  const pagination: PaginationInfo = payload.pagination ?? {
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalElements: inquiryList.length,
  };

  return { inquiryList, pagination };
};

export type AnswerInquiryRequest = {
  reply: string;
};

/**
 * 관리자 문의 답변 등록
 */
export const answerAdminInquiry = async (
  inquiryId: number,
  request: AnswerInquiryRequest
): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `문의 답변 등록 실패: ${response.status} ${response.statusText}`
    );
  }
};

/**
 * 관리자 배치 수동 실행 (일별 유저 통계 집계)
 */
export const runAggregateSummaryBatch = async (targetDate: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/batch/aggregate-summary`, {
    method: 'POST',
    body: JSON.stringify({ targetDate }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(
      errorData.message || `배치 실행 실패: ${response.status} ${response.statusText}`
    );
  }
};
