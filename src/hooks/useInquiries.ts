import { useQuery } from '@tanstack/react-query'
import { getInquiries, type GetInquiriesResponse } from '@/api/inquiry'

export const useInquiries = () =>
  useQuery<GetInquiriesResponse>({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
    staleTime: 1000 * 60, // 1분
  })
