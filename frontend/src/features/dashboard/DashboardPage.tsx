import { useDashboardSummary } from './useDashboard';
import { CardSkeleton, ErrorFallback, EmptyState, StatusBadge } from '@/components/ui';
import { cn } from '@/utils';

export function DashboardPage() {
    const { data, isLoading, isError, error, refetch } = useDashboardSummary();

    if (isLoading) return <DashboardSkeleton />;
    if (isError) {
        return (
            <ErrorFallback
                message={(error as { message?: string })?.message ?? 'Failed to load dashboard.'}
                onRetry={() => void refetch()}
            />
        );
    }
    if (!data || data.total_employees === 0) {
        return (
            <EmptyState
                title="No employees yet"
                message="Add employees to see dashboard insights."
            />
        );
    }

    const cards = [
        {
            label: 'Total Employees',
            value: data.total_employees,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            label: 'Present Today',
            value: data.summary.present,
            color: 'text-green-600 bg-green-50',
        },
        {
            label: 'Absent Today',
            value: data.summary.absent,
            color: 'text-red-600 bg-red-50',
        },
        {
            label: 'Attendance Rate',
            value: `${data.attendance_rate.toFixed(1)}%`,
            color: 'text-indigo-600 bg-indigo-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <p className={cn('mt-2 text-3xl font-bold', card.color.split(' ')[0])}>
                            {card.value}
                        </p>
                        <div className={cn('mt-3 inline-block rounded-lg px-2 py-1 text-xs font-medium', card.color)}>
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Department Breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Department Breakdown
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Attendance distribution by department
                    </p>
                </div>
                {data.department_breakdown.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            title="No data"
                            message="No department breakdown data available."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Present
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Absent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Half Day
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        On Leave
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {data.department_breakdown.map((dept) => (
                                    <tr key={dept.department} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {dept.department}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status="PRESENT" />{' '}
                                            <span className="ml-1 text-gray-700">{dept.present}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status="ABSENT" />{' '}
                                            <span className="ml-1 text-gray-700">{dept.absent}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status="HALF_DAY" />{' '}
                                            <span className="ml-1 text-gray-700">{dept.half_day}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status="ON_LEAVE" />{' '}
                                            <span className="ml-1 text-gray-700">{dept.on_leave}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-5 w-48 rounded bg-gray-200" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 w-full rounded bg-gray-100" />
                    ))}
                </div>
            </div>
        </div>
    );
}
