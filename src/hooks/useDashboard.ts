import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, type DashboardResponse } from '@/api/dashboard';

/**
 * 대시보드 통계 조회 훅
 */
export const useDashboardStats = () => {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
