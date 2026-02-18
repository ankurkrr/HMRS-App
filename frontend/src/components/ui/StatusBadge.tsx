import { cn } from '@/utils';

type StatusType = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';

const badgeStyles: Record<StatusType, string> = {
    PRESENT: 'bg-green-50 text-green-700 ring-green-600/20',
    ABSENT: 'bg-red-50 text-red-700 ring-red-600/20',
    HALF_DAY: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    ON_LEAVE: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

const labels: Record<StatusType, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    HALF_DAY: 'Half Day',
    ON_LEAVE: 'On Leave',
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const s = status as StatusType;
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                badgeStyles[s] ?? 'bg-gray-50 text-gray-700 ring-gray-600/20',
                className,
            )}
        >
            {labels[s] ?? status}
        </span>
    );
}
