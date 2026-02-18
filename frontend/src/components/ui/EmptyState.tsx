import { InboxIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
    title?: string;
    message?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    title = 'No data found',
    message = 'There are no records to display yet.',
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <InboxIcon className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
