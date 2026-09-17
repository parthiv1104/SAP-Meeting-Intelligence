export default function Table({ columns, children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-xs ${className}`}>
      <table className="w-full min-w-[760px] text-left text-sm table-auto">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/60">
            {columns.map((col, idx) => {
              const label = typeof col === 'string' ? col : col.label;
              const colClass = typeof col === 'string' ? '' : (col.className || '');
              return (
                <th
                  key={label || idx}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 ${colClass}`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  );
}
