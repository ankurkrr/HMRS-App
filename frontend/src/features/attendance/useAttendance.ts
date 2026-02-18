import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAttendance, markAttendance, deleteAttendance } from '@/services/attendance';
import { listEmployees } from '@/services/employees';
import { queryKeys } from '@/app/queryClient';
import { showSuccess, showError } from '@/utils';
import { isApiError } from '@/services/apiClient';
import type { AttendanceCreate, AttendanceListParams } from '@/types';

export function useAttendance(params: AttendanceListParams = {}) {
    return useQuery({
        queryKey: queryKeys.attendance.list(params as Record<string, unknown>),
        queryFn: () => listAttendance(params),
        staleTime: 60 * 1000, // 1 minute
    });
}

/** Load first 100 active employees for dropdowns */
export function useEmployeesDropdown() {
    return useQuery({
        queryKey: queryKeys.employees.list({ per_page: 100, is_active: true }),
        queryFn: () => listEmployees({ per_page: 100, is_active: true }),
        staleTime: 5 * 60 * 1000,
        select: (data) =>
            data.data.map((emp) => ({
                value: emp.id,
                label: `${emp.name} (${emp.employee_code})`,
            })),
    });
}

export function useMarkAttendance(onSuccess?: () => void) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: AttendanceCreate) => markAttendance(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.attendance.all });
            void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
            showSuccess('Attendance recorded successfully.');
            onSuccess?.();
        },
        onError: (err: unknown) => {
            if (isApiError(err)) {
                if (err.error_code === 'ATTENDANCE_DUPLICATE' || err.status === 409) {
                    showError(err.message || 'Attendance already marked for this date.');
                } else {
                    showError(err.message);
                }
            } else {
                showError('Failed to mark attendance.');
            }
        },
    });
}

export function useDeleteAttendance() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteAttendance(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.attendance.all });
            void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
            showSuccess('Attendance record deleted.');
        },
        onError: (err: unknown) => {
            if (isApiError(err)) {
                showError(err.message);
            } else {
                showError('Failed to delete attendance.');
            }
        },
    });
}
