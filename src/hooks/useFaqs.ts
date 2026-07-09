import { useQuery } from '@tanstack/react-query'
import { getFaqs, type GetFaqsResponse } from '@/api/faq'

export const useFaqs = () =>
  useQuery<GetFaqsResponse>({
    queryKey: ['faqs'],
    queryFn: () => getFaqs(), // 전체 조회 — category 미전달
    staleTime: 1000 * 60 * 5, // FAQ는 정적 콘텐츠
  })
