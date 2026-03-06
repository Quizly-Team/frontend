import { authenticatedFetch } from './account';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const FAQ_CATEGORIES = {
  SERVICE_INTRO: '서비스 소개',
  QUIZ_GENERATION: '문제 생성',
  WRONG_ANSWER: '오답 관리',
  TECH_SUPPORT: '기술 지원',
} as const;

export type FaqCategory = keyof typeof FAQ_CATEGORIES;

export type FaqDetail = { id: number; question: string; answer: string };
export type FaqCategoryGroup = { category: FaqCategory; description: string; faqDetailList: FaqDetail[] };
export type GetFaqsResponse = { faqCategoryGroupList: FaqCategoryGroup[] };
export type CreateFaqRequest = { category: FaqCategory; question: string; answer: string };
export type CreateFaqResponse = { faqId: number; category: FaqCategory; question: string; answer: string };

export type FlatFaqItem = {
  id: number;
  category: FaqCategory;
  categoryDescription: string;
  question: string;
  answer: string;
};

export const flattenFaqGroups = (response: GetFaqsResponse): FlatFaqItem[] => {
  const items: FlatFaqItem[] = [];
  for (const group of response.faqCategoryGroupList) {
    const desc = FAQ_CATEGORIES[group.category] ?? group.description;
    for (const detail of group.faqDetailList) {
      items.push({
        id: detail.id,
        category: group.category,
        categoryDescription: desc,
        question: detail.question,
        answer: detail.answer,
      });
    }
  }
  return items;
};

export const getFaqs = async (category?: FaqCategory): Promise<GetFaqsResponse> => {
  const url = new URL(`${API_BASE_URL}/faqs`);
  if (category) {
    url.searchParams.set('category', category);
  }

  const response = await fetch(url.toString(), { method: 'GET' });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData.message || `FAQ 조회 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const createAdminFaq = async (request: CreateFaqRequest): Promise<CreateFaqResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/faqs`, {
    method: 'POST',
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
    throw new Error(errorData.message || `FAQ 등록 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const deleteAdminFaq = async (faqId: number): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin/faqs/${faqId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData.message || `FAQ 삭제 실패: ${response.status} ${response.statusText}`);
  }
};
