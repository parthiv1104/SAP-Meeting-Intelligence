import { AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import Card from '../ui/Card';

const ICONS = { critical: AlertTriangle, warning: AlertTriangle, success: TrendingUp };
const TONE = {
  critical: 'text-critical-500 bg-critical-50',
  warning: 'text-warning-500 bg-warning-50',
  success: 'text-success-500 bg-success-50',
};

export default function InsightCard({ insights }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={15} className="text-brand-500" />
        <h3 className="text-sm font-semibold text-ink-900">Intelligence Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = ICONS[insight.type] || CheckCircle2;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${TONE[insight.type]}`}>
                <Icon size={13} />
              </span>
              <p className="text-sm leading-snug text-ink-700">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
