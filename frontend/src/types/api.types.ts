/* ------------------------------------------------------------------ */
/*  API types — strict mirror of the backend OpenAPI contract          */
/* ------------------------------------------------------------------ */

// ── Pagination ──────────────────────────────────────────────────────

export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// ── Employee ────────────────────────────────────────────────────────

export interface EmployeeCreate {
    employee_code: string;
    name: string;
    email: string;
    department: string;
    designation?: string | null;
    date_of_joining: string; // YYYY-MM-DD
    phone?: string | null;
}

export interface EmployeeUpdate {
    name?: string | null;
    email?: string | null;
    department?: string | null;
    designation?: string | null;
    date_of_joining?: string | null;
    phone?: string | null;
    is_active?: boolean | null;
}

export interface EmployeeResponse {
    id: string;
    employee_code: string;
    name: string;
    email: string;
    department: string;
    designation: string | null;
    date_of_joining: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ── Attendance ──────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';

export interface AttendanceCreate {
    employee_id: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    check_in?: string | null;  // HH:MM:SS
    check_out?: string | null; // HH:MM:SS
    notes?: string | null;
}

export interface AttendanceUpdate {
    status?: AttendanceStatus | null;
    check_in?: string | null;
    check_out?: string | null;
    notes?: string | null;
}

export interface AttendanceResponse {
    id: string;
    employee_id: string;
    employee_name: string | null;
    employee_code: string | null;
    date: string;
    status: string;
    check_in: string | null;
    check_out: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// ── Dashboard ───────────────────────────────────────────────────────

export interface DateRange {
    date_from: string;
    date_to: string;
}

export interface StatusSummary {
    present: number;
    absent: number;
    half_day: number;
    on_leave: number;
}

export interface DepartmentBreakdown {
    department: string;
    present: number;
    absent: number;
    half_day: number;
    on_leave: number;
}

export interface DashboardSummaryResponse {
    date_range: DateRange;
    total_employees: number;
    summary: StatusSummary;
    attendance_rate: number;
    department_breakdown: DepartmentBreakdown[];
}

// ── Error ───────────────────────────────────────────────────────────

export interface ApiError {
    status: number;
    error_code: string;
    message: string;
    details?: Record<string, unknown>;
}

// ── Query Params ────────────────────────────────────────────────────

export interface EmployeeListParams {
    page?: number;
    per_page?: number;
    department?: string;
    is_active?: boolean;
    search?: string;
}

export interface AttendanceListParams {
    page?: number;
    per_page?: number;
    employee_id?: string;
    date?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    department?: string;
}

export interface DashboardSummaryParams {
    date_from?: string;
    date_to?: string;
    department?: string;
    include_inactive?: boolean;
}
