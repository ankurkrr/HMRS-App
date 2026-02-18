import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/services/employees';
import { queryKeys } from '@/app/queryClient';
import { showSuccess, showError } from '@/utils';
import { isApiError } from '@/services/apiClient';
import type { EmployeeCreate, EmployeeListParams, EmployeeUpdate } from '@/types';

export function useEmployees(params: EmployeeListParams = {}) {
    return useQuery({
        queryKey: queryKeys.employees.list(params as Record<string, unknown>),
        queryFn: () => listEmployees(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateEmployee(onSuccess?: () => void) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeCreate) => createEmployee(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.employees.all });
            showSuccess('Employee created successfully.');
            onSuccess?.();
        },
        onError: (err: unknown) => {
            if (isApiError(err)) {
                showError(err.message);
            } else {
                showError('Failed to create employee.');
            }
        },
    });
}

export function useUpdateEmployee() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: EmployeeUpdate }) =>
            updateEmployee(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.employees.all });
            showSuccess('Employee updated successfully.');
        },
        onError: (err: unknown) => {
            if (isApiError(err)) {
                showError(err.message);
            } else {
                showError('Failed to update employee.');
            }
        },
    });
}

export function useDeleteEmployee() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteEmployee(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.employees.all });
            showSuccess('Employee deleted successfully.');
        },
        onError: (err: unknown) => {
            if (isApiError(err)) {
                showError(err.message);
            } else {
                showError('Failed to delete employee.');
            }
        },
    });
}
