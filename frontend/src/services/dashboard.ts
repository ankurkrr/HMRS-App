import { apiFetch } from './apiClient';
import type { DashboardSummaryResponse, DashboardSummaryParams } from '@/types';

export function getDashboardSummary(params: DashboardSummaryParams = {}): Promise<DashboardSummaryResponse> {
    const query = new URLSearchParams();
    if (params.date_from) query.set('date_from', params.date_from);
    if (params.date_to) query.set('date_to', params.date_to);
    if (params.department) query.set('department', params.department);
    if (params.include_inactive !== undefined) query.set('include_inactive', String(params.include_inactive));

    const qs = query.toString();
    return apiFetch<DashboardSummaryResponse>(`/api/v1/dashboard/summary${qs ? `?${qs}` : ''}`);
}
