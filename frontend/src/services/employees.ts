import { apiFetch } from './apiClient';
import type {
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListParams,
    PaginatedResponse,
} from '@/types';

const BASE = '/api/v1/employees';

export function listEmployees(
    params: EmployeeListParams = {},
): Promise<PaginatedResponse<EmployeeResponse>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.department) query.set('department', params.department);
    if (params.is_active !== undefined) query.set('is_active', String(params.is_active));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    return apiFetch<PaginatedResponse<EmployeeResponse>>(`${BASE}${qs ? `?${qs}` : ''}`);
}

export function createEmployee(data: EmployeeCreate): Promise<EmployeeResponse> {
    return apiFetch<EmployeeResponse>(BASE, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}


export function updateEmployee(id: string, data: EmployeeUpdate): Promise<EmployeeResponse> {
    return apiFetch<EmployeeResponse>(`${BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function deleteEmployee(id: string): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' });
}
