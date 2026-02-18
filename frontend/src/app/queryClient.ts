import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/services/apiClient';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            retry: (failureCount, error) => {
                if (isApiError(error)) {
                    // Never retry validation or conflict errors
                    if (error.status === 422 || error.status === 409 || error.status === 404) {
                        return false;
                    }
                }
                return failureCount < 1;
            },
        },
        mutations: {
            retry: false,
        },
    },
});

/* ── Query key factories ─────────────────────────────────────────── */

export const queryKeys = {
    employees: {
        all: ['employees'] as const,
        list: (params: Record<string, unknown>) => ['employees', params] as const,
    },
    attendance: {
        all: ['attendance'] as const,
        list: (params: Record<string, unknown>) => ['attendance', params] as const,
    },
    dashboard: {
        all: ['dashboard'] as const,
        summary: (filters?: Record<string, unknown>) => ['dashboard', 'summary', filters] as const,
    },
} as const;
