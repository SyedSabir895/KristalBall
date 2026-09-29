import { Spinner } from './ui';

// columns: [{ key, label, render?: (row) => node, align?: 'right' }]
// Desktop → normal table. Mobile → one card per row (tables don't fit on phones).
export default function DataTable({ columns, rows, loading, error, emptyText = 'No records found', onRowClick }) {
  const cell = (row, col) => (col.render ? col.render(row) : row[col.key] ?? '—');

  if (error) {
    return <div className="card p-6 text-center text-sm text-red-600">{error}</div>;
  }

  if (!rows) {
    return (
      <div className="card flex justify-center p-10">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className="card p-10 text-center text-sm text-stone-500">{emptyText}</div>;
  }

  const clickable = onRowClick ? 'cursor-pointer hover:bg-army-50/60' : '';

  return (
    <div className={`relative transition-opacity ${loading ? 'opacity-60' : ''}`}>
      {/* Desktop table */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs tracking-wide text-stone-500 uppercase">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, i) => (
              <tr key={row.id ?? i} onClick={() => onRowClick?.(row)} className={`transition ${clickable}`}>
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                    {cell(row, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div key={row.id ?? i} onClick={() => onRowClick?.(row)} className={`card p-4 ${clickable}`}>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {columns.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-xs text-stone-500">{c.label}</dt>
                  <dd className="truncate font-medium text-stone-800">{cell(row, c)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
