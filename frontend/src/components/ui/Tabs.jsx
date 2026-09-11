export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-ink-100">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`focus-ring whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
            active === tab
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
