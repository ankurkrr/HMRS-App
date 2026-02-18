import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/services/dashboard';
import { queryKeys } from '@/app/queryClient';

import type { DashboardSummaryParams } from '@/types';

export function useDashboardSummary(params: DashboardSummaryParams = {}) {
    return useQuery({
        queryKey: queryKeys.dashboard.summary(params as unknown as Record<string, unknown>),
        queryFn: () => getDashboardSummary(params),
        staleTime: 30 * 1000, // 30 seconds
    });
}
