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
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-sm">
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white text-left">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row) => (
                        <tr key={keyExtractor(row)}>
                            {columns.map((col, idx) => (
                                <td key={idx} className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
export default DataTable;
