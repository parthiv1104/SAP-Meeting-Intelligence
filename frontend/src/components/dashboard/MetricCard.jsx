import Card from '../ui/Card';

export default function MetricCard({ label, value, delta, deltaTone = 'success', icon: Icon }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        {Icon && <Icon size={15} className="text-ink-300" />}
      </div>
      <p className="data-num text-2xl font-semibold text-ink-900">{value}</p>
      {delta && (
        <p className={`text-xs font-medium ${deltaTone === 'success' ? 'text-success-600' : deltaTone === 'critical' ? 'text-critical-600' : 'text-ink-400'}`}>
          {delta}
        </p>
      )}
    </Card>
  );
}
