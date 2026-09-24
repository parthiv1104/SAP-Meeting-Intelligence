import Card from '../ui/Card';

export default function MetricCard({ label, value, delta, deltaTone = 'success', icon: Icon }) {
  return (
    <Card className="flex flex-col justify-between gap-2 h-full min-h-[110px]">
      <div className="flex items-start justify-between gap-1.5 min-h-[32px]">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500 leading-snug">{label}</p>
        {Icon && <Icon size={15} className="text-ink-300 shrink-0 mt-0.5" />}
      </div>
      <div>
        <p className="data-num text-2xl font-semibold text-ink-900">{value}</p>
        {delta && (
          <p className={`mt-1 text-xs font-medium ${deltaTone === 'success' ? 'text-success-600' : deltaTone === 'critical' ? 'text-critical-600' : 'text-ink-400'}`}>
            {delta}
          </p>
        )}
      </div>
    </Card>
  );
}
