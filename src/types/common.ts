export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ErrorResponse = {
  message: string;
  code?: string;
  details?: unknown;
};
