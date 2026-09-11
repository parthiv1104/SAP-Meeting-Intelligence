export default function Dropdown({ label, value, options, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      {label && <span className="text-ink-500">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}
