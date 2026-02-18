/* ------------------------------------------------------------------ */
/*  Centralized API client with error normalization & timeout          */
/* ------------------------------------------------------------------ */

import type { ApiError } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Normalised fetch wrapper.
 * - All responses go through JSON parsing.
 * - Non-2xx responses are normalised into `ApiError`.
 * - A 10 s AbortController timeout is applied by default.
 */
export async function apiFetch<T>(
    path: string,
    options: RequestInit & { timeout?: number } = {},
): Promise<T> {
    const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...fetchOptions.headers,
            },
        });

        // 204 No Content — nothing to parse
        if (response.status === 204) {
            return undefined as T;
        }

        // Try to parse JSON body
        let body: unknown;
        try {
            body = await response.json();
        } catch {
            body = null;
        }

        if (!response.ok) {
            throw normalizeError(response.status, body);
        }

        return body as T;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw {
                status: 408,
                error_code: 'REQUEST_TIMEOUT',
                message: 'Request timed out. Please try again.',
            } satisfies ApiError;
        }
        // Re-throw if already normalised
        if (isApiError(error)) throw error;

        throw {
            status: 0,
            error_code: 'NETWORK_ERROR',
            message: 'Unable to connect to the server. Please check your connection.',
        } satisfies ApiError;
    } finally {
        clearTimeout(timer);
    }
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function normalizeError(status: number, body: unknown): ApiError {
    // Backend shape: { error_code, message, details? }
    if (body && typeof body === 'object' && 'message' in body) {
        const b = body as Record<string, unknown>;
        return {
            status,
            error_code: (b.error_code as string) ?? `HTTP_${status}`,
            message: (b.message as string) ?? statusMessage(status),
            details: (b.details as Record<string, unknown>) ?? undefined,
        };
    }

    // FastAPI validation shape: { detail: [...] }
    if (body && typeof body === 'object' && 'detail' in body) {
        const detail = (body as Record<string, unknown>).detail;
        const msg = Array.isArray(detail)
            ? detail.map((d: Record<string, unknown>) => d.msg).join('; ')
            : String(detail);
        return {
            status,
            error_code: `VALIDATION_${status}`,
            message: msg || statusMessage(status),
            details: { detail },
        };
    }

    return {
        status,
        error_code: `HTTP_${status}`,
        message: statusMessage(status),
    };
}

function statusMessage(status: number): string {
    switch (status) {
        case 400:
            return 'Bad request. Please check your input.';
        case 404:
            return 'Resource not found.';
        case 409:
            return 'A conflict occurred. The resource may already exist.';
        case 422:
            return 'Validation failed. Please check your input.';
        case 429:
            return 'Too many requests. Please wait a moment.';
        default:
            return status >= 500
                ? 'An unexpected server error occurred. Please try again later.'
                : `Request failed (${status}).`;
    }
}

export function isApiError(err: unknown): err is ApiError {
    return (
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        'error_code' in err &&
        'message' in err
    );
}
