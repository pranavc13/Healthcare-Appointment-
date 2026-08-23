import { clsx } from 'clsx';

// Renders a normal table on sm+ screens; below that, each row becomes a
// label:value card so nothing overflows on mobile.
export default function Table({ columns, data, keyField = '_id', onRowClick }) {
  return (
    <>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900/40 border-b border-border dark:border-slate-700">
              {columns.map((col) => (
                <th key={col.key} className="text-left text-xs uppercase tracking-wider text-text-muted font-medium px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-gray-100 dark:border-slate-700 last:border-0 text-sm text-text-secondary dark:text-slate-300 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-900/40'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        {data.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={clsx('px-4 py-3 space-y-1.5', onRowClick && 'cursor-pointer active:bg-gray-50 dark:active:bg-slate-900/40')}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-text-muted shrink-0">{col.header}</span>
                <span className="text-sm text-text-secondary dark:text-slate-300 text-right">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
