import { CalendarClock, ClipboardList, GitCommit, CircleHelp, BrainCog } from 'lucide-react';
import Card from '../ui/Card';

const ICONS = { meeting: CalendarClock, requirement: ClipboardList, decision: GitCommit, question: CircleHelp, knowledge: BrainCog };

export default function RecentActivityList({ items }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-ink-900">Recent Activity</h3>
      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = ICONS[item.type] || CalendarClock;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-ink-500">
                <Icon size={13} />
              </span>
              <div>
                <p className="text-sm text-ink-700">{item.text}</p>
                <p className="text-xs text-ink-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
