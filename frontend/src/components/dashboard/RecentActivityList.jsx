import { CalendarClock, ClipboardList, GitCommit, CircleHelp, BrainCog, Sparkles, FileText, Activity } from 'lucide-react';
import Card from '../ui/Card';

const ICONS = {
  meeting: CalendarClock,
  requirement: ClipboardList,
  decision: GitCommit,
  question: CircleHelp,
  knowledge: BrainCog,
  analysis: Sparkles,
  document: FileText,
};

export default function RecentActivityList({ items = [] }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-ink-900">Recent Activity</h3>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, i) => {
            const Icon = ICONS[item.type] || CalendarClock;
            const text = item.text || item.title || 'Activity logged';
            const time = item.time || item.timestamp || 'Recently';

            return (
              <div key={item.id || i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-ink-500">
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-700 truncate">{text}</p>
                  <p className="text-xs text-ink-400">{time}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-ink-400">
          <Activity size={20} className="mx-auto text-ink-300 mb-1" />
          <p>No recent activity</p>
        </div>
      )}
    </Card>
  );
}
