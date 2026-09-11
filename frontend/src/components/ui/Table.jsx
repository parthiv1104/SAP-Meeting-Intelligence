export default function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/60">
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  );
}
