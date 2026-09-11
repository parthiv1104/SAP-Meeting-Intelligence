function toneFor(value) {
  if (value >= 75) return 'bg-success-500';
  if (value >= 50) return 'bg-warning-500';
  return 'bg-critical-500';
}

export default function ProgressBar({ value, tone, showLabel = false, height = 'h-1.5' }) {
  const barTone = tone || toneFor(value);
  return (
    <div className="flex items-center gap-2">
      <div className={`w-full ${height} rounded-full bg-ink-100`}>
        <div
          className={`${height} rounded-full ${barTone} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && <span className="data-num text-xs font-medium text-ink-600 w-9 text-right">{value}%</span>}
    </div>
  );
}
