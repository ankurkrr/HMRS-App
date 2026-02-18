import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ErrorFallbackProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorFallback({
    message = 'Something went wrong. Please try again.',
    onRetry,
}: ErrorFallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <ExclamationTriangleIcon className="mb-4 h-12 w-12 text-red-400" />
            <h3 className="text-sm font-semibold text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
            {onRetry && (
                <div className="mt-4">
                    <Button variant="secondary" size="sm" onClick={onRetry}>
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
}
