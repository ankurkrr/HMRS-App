import { apiFetch } from './apiClient';
import type {
    AttendanceCreate,
    AttendanceResponse,
    AttendanceListParams,
    PaginatedResponse,
} from '@/types';

const BASE = '/api/v1/attendance';

export function listAttendance(
    params: AttendanceListParams = {},
): Promise<PaginatedResponse<AttendanceResponse>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.employee_id) query.set('employee_id', params.employee_id);
    if (params.date) query.set('date', params.date);
    if (params.date_from) query.set('date_from', params.date_from);
    if (params.date_to) query.set('date_to', params.date_to);
    if (params.status) query.set('status', params.status);
    if (params.department) query.set('department', params.department);

    const qs = query.toString();
    return apiFetch<PaginatedResponse<AttendanceResponse>>(`${BASE}${qs ? `?${qs}` : ''}`);
}

export function markAttendance(data: AttendanceCreate): Promise<AttendanceResponse> {
    return apiFetch<AttendanceResponse>(BASE, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function deleteAttendance(id: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' });
}
