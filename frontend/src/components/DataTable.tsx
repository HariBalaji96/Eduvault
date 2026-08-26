import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string | number;
}

function DataTable<T>({ data, columns, keyExtractor }: DataTableProps<T>) {
    return (
        <div className="modern-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-border-subtle">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-[11px]">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle bg-transparent">
                        {data.map((row) => (
                            <tr key={keyExtractor(row)} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 group">
                                {columns.map((col, idx) => (
                                    <td key={idx} className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                        {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-sm font-medium text-gray-400">No data available to display</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default DataTable;
