import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createInquiry,
  type CreateInquiryRequest,
  type CreateInquiryResponse,
} from '@/api/inquiry'

export const useCreateInquiry = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateInquiryResponse, Error, CreateInquiryRequest>({
    mutationFn: createInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
    },
  })
}
