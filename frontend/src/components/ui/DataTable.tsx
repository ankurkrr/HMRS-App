import {
    flexRender,
    type Table as TanstackTable,
} from '@tanstack/react-table';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

interface DataTableProps<T> {
    table: TanstackTable<T>;
    isLoading?: boolean;
    emptyTitle?: string;
    emptyMessage?: string;
}

export function DataTable<T>({
    table,
    isLoading = false,
    emptyTitle,
    emptyMessage,
}: DataTableProps<T>) {
    const columnCount = table.getAllColumns().length;
    const rowModel = table.getRowModel();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                {isLoading ? (
                    <TableSkeleton columns={columnCount} rows={5} />
                ) : rowModel.rows.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={columnCount}>
                                <EmptyState title={emptyTitle} message={emptyMessage} />
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {rowModel.rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="whitespace-nowrap px-4 py-3 text-sm text-gray-700"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
        </div>
    );
}
