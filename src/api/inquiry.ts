import { apiClient } from './apiClient'

export type InquiryStatus = 'WAITING' | 'COMPLETED'

export type InquiryDetail = {
  inquiryId?: number
  title?: string
  content?: string
  reply?: string
  repliedAt?: string
  status?: InquiryStatus
  createdAt?: string
  updatedAt?: string
}

export type GetInquiriesResponse = {
  success?: boolean
  inquiryList?: InquiryDetail[]
}

export type CreateInquiryRequest = {
  title: string
  content: string
}

export type CreateInquiryResponse = {
  success?: boolean
  inquiryId?: number
  status?: InquiryStatus
}

export const getInquiries = (): Promise<GetInquiriesResponse> =>
  apiClient.get<GetInquiriesResponse>('/inquiries')

export const createInquiry = (
  req: CreateInquiryRequest,
): Promise<CreateInquiryResponse> =>
  apiClient.post<CreateInquiryResponse>('/inquiries', req)
