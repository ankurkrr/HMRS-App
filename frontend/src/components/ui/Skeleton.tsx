import { cn } from '@/utils';

export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
                className,
            )}
        >
            <div className="mb-3 h-3 w-24 rounded bg-gray-200" />
            <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200" />
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({
    columns = 6,
    rows = 5,
}: {
    columns?: number;
    rows?: number;
}) {
    return (
        <tbody>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </tbody>
    );
}
