import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import type { PaginationMeta } from '@/types';

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
    const { page, total_pages, total } = meta;

    if (total_pages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-500">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{total_pages}</span>{' '}
                <span className="text-gray-400">({total} total)</span>
            </p>
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= total_pages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
