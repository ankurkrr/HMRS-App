import { useState, useMemo, useCallback } from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { TrashIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import {
    Button,
    DataTable,
    Pagination,
    ErrorFallback,
    ConfirmDialog,
    StatusBadge,
    Input,
    Select,
} from '@/components/ui';
import { formatDate, formatTime } from '@/utils';
import { useAttendance, useDeleteAttendance, useEmployeesDropdown } from './useAttendance';
import { MarkAttendanceForm } from './MarkAttendanceForm';
import type { AttendanceResponse } from '@/types';

const columnHelper = createColumnHelper<AttendanceResponse>();

const statusFilterOptions = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'HALF_DAY', label: 'Half Day' },
    { value: 'ON_LEAVE', label: 'On Leave' },
];

export function AttendancePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page') ?? '1');
    const dateFilter = searchParams.get('date') ?? '';
    const employeeFilter = searchParams.get('employee_id') ?? '';
    const statusFilter = searchParams.get('status') ?? '';

    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AttendanceResponse | null>(null);

    const { data: employees = [] } = useEmployeesDropdown();

    const setParam = useCallback(
        (key: string, value: string) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (value) next.set(key, value);
                else next.delete(key);
                // Reset page when filter changes
                if (key !== 'page') next.set('page', '1');
                return next;
            });
        },
        [setSearchParams],
    );

    const setPage = useCallback(
        (p: number) => setParam('page', String(p)),
        [setParam],
    );

    const { data, isLoading, isError, error, refetch } = useAttendance({
        page,
        per_page: 20,
        date: dateFilter || undefined,
        employee_id: employeeFilter || undefined,
        status: statusFilter || undefined,
    });

    const deleteMutation = useDeleteAttendance();

    const columns = useMemo(
        () => [
            columnHelper.accessor('employee_name', {
                header: 'Employee',
                cell: (info) => (
                    <span className="font-medium text-gray-900">
                        {info.getValue() ?? '—'}
                    </span>
                ),
            }),
            columnHelper.accessor('employee_code', {
                header: 'Code',
                cell: (info) => (
                    <span className="font-mono text-xs text-gray-600">
                        {info.getValue() ?? '—'}
                    </span>
                ),
            }),
            columnHelper.accessor('date', {
                header: 'Date',
                cell: (info) => formatDate(info.getValue()),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => <StatusBadge status={info.getValue()} />,
            }),
            columnHelper.accessor('check_in', {
                header: 'Check-in',
                cell: (info) => formatTime(info.getValue()),
            }),
            columnHelper.accessor('check_out', {
                header: 'Check-out',
                cell: (info) => formatTime(info.getValue()),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => (
                    <button
                        onClick={() => setDeleteTarget(info.row.original)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Delete attendance record"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                ),
            }),
        ],
        [],
    );

    const table = useReactTable({
        data: data?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isError) {
        return (
            <ErrorFallback
                message={(error as { message?: string })?.message ?? 'Failed to load attendance.'}
                onRetry={() => void refetch()}
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FunnelIcon className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button onClick={() => setShowForm(true)}>
                    <PlusIcon className="h-4 w-4" />
                    Mark Attendance
                </Button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3">
                    <Input
                        id="filter-date"
                        label="Date"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setParam('date', e.target.value)}
                    />
                    <Select
                        id="filter-employee"
                        label="Employee"
                        placeholder="All employees"
                        options={employees}
                        value={employeeFilter}
                        onChange={(e) => setParam('employee_id', e.target.value)}
                    />
                    <Select
                        id="filter-status"
                        label="Status"
                        placeholder="All statuses"
                        options={statusFilterOptions}
                        value={statusFilter}
                        onChange={(e) => setParam('status', e.target.value)}
                    />
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <DataTable
                    table={table}
                    isLoading={isLoading}
                    emptyTitle="No attendance records"
                    emptyMessage="Mark attendance to see records here."
                />
                {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
            </div>

            {/* Mark Attendance modal */}
            <MarkAttendanceForm open={showForm} onClose={() => setShowForm(false)} />

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) {
                        deleteMutation.mutate(deleteTarget.id, {
                            onSettled: () => setDeleteTarget(null),
                        });
                    }
                }}
                title="Delete Attendance Record"
                message={`Are you sure you want to delete the attendance record for "${deleteTarget?.employee_name}" on ${deleteTarget ? formatDate(deleteTarget.date) : ''}?`}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
