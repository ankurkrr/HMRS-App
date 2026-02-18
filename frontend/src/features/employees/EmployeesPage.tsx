import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { TrashIcon, PlusIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import {
    Button,
    DataTable,
    Pagination,
    ErrorFallback,
    ConfirmDialog,
    Input,
} from '@/components/ui';
import { cn, debounce, formatDate } from '@/utils';
import { useEmployees, useDeleteEmployee, useUpdateEmployee } from './useEmployees';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import type { EmployeeResponse } from '@/types';

const columnHelper = createColumnHelper<EmployeeResponse>();

export function EmployeesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page') ?? '1');
    const search = searchParams.get('search') ?? '';

    const [searchInput, setSearchInput] = useState(search);
    const [showCreate, setShowCreate] = useState(false);

    // Action State
    const [actionTarget, setActionTarget] = useState<EmployeeResponse | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'deactivate' | null>(null);

    // Debounced URL sync
    const debouncedSetSearch = useMemo(
        () =>
            debounce((val: string) => {
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (val) next.set('search', val);
                    else next.delete('search');
                    next.set('page', '1'); // reset page on search
                    return next;
                });
            }, 300),
        [setSearchParams],
    );

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchInput(e.target.value);
            debouncedSetSearch(e.target.value);
        },
        [debouncedSetSearch],
    );

    const setPage = useCallback(
        (p: number) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('page', String(p));
                return next;
            });
        },
        [setSearchParams],
    );

    const { data, isLoading, isError, error, refetch } = useEmployees({
        page,
        per_page: 20,
        search: search || undefined,
    });

    const deleteMutation = useDeleteEmployee();
    const updateMutation = useUpdateEmployee();

    // Memoized columns
    const columns = useMemo(
        () => [
            columnHelper.accessor('employee_code', {
                header: 'Code',
                cell: (info) => (
                    <span className="font-mono text-xs text-gray-600">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: (info) => (
                    <span className="font-medium text-gray-900">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => <span className="text-gray-500">{info.getValue()}</span>,
            }),
            columnHelper.accessor('department', {
                header: 'Department',
            }),
            columnHelper.accessor('date_of_joining', {
                header: 'Joined',
                cell: (info) => formatDate(info.getValue()),
            }),
            columnHelper.accessor('is_active', {
                header: 'Status',
                cell: (info) => (
                    <span
                        className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                            info.getValue()
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : 'bg-gray-100 text-gray-600 ring-gray-500/20',
                        )}
                    >
                        {info.getValue() ? 'Active' : 'Inactive'}
                    </span>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        {info.row.original.is_active && (
                            <button
                                onClick={() => {
                                    setActionTarget(info.row.original);
                                    setActionType('deactivate');
                                }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                aria-label={`Deactivate ${info.row.original.name}`}
                                title="Deactivate Employee"
                            >
                                <NoSymbolIcon className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setActionTarget(info.row.original);
                                setActionType('delete');
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label={`Delete ${info.row.original.name}`}
                            title="Delete Employee"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
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
                message={(error as { message?: string })?.message ?? 'Failed to load employees.'}
                onRetry={() => void refetch()}
            />
        );
    }

    const resetAction = () => {
        setActionTarget(null);
        setActionType(null);
    };

    const handleConfirmAction = () => {
        if (!actionTarget) return;

        if (actionType === 'delete') {
            deleteMutation.mutate(actionTarget.id, {
                onSettled: resetAction,
            });
        } else if (actionType === 'deactivate') {
            updateMutation.mutate(
                { id: actionTarget.id, data: { is_active: false } },
                { onSettled: resetAction }
            );
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xs">
                    <Input
                        id="search-employees"
                        placeholder="Search by name, email, or code..."
                        value={searchInput}
                        onChange={handleSearchChange}
                    />
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <PlusIcon className="h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <DataTable
                    table={table}
                    isLoading={isLoading}
                    emptyTitle="No employees found"
                    emptyMessage={search ? 'Try a different search term.' : 'Create your first employee to get started.'}
                />
                {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
            </div>

            {/* Create modal */}
            <CreateEmployeeModal open={showCreate} onClose={() => setShowCreate(false)} />

            {/* Action confirm */}
            <ConfirmDialog
                open={!!actionTarget}
                onClose={resetAction}
                onConfirm={handleConfirmAction}
                title={actionType === 'delete' ? 'Delete Employee' : 'Deactivate Employee'}
                confirmLabel={actionType === 'delete' ? 'Delete' : 'Deactivate'}
                message={
                    actionType === 'delete'
                        ? `Are you sure you want to permanently delete "${actionTarget?.name}"? This will also remove all their attendance records. This action cannot be undone.`
                        : `Are you sure you want to deactivate "${actionTarget?.name}"? They will no longer appear in the active employees list for attendance.`
                }
                isLoading={deleteMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
