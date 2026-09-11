import { X } from 'lucide-react';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { Bell } from 'lucide-react';
import { notifications } from '../../data/mockData';

export default function NotificationDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/30" />
      <div
        className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-ink-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-900">Notifications</h3>
          <button onClick={onClose} className="focus-ring rounded-md p-1 text-ink-400 hover:bg-ink-100">
            <X size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-57px)] overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="You're all caught up" description="No new notifications right now." />
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-lg px-3 py-3 ${n.read ? '' : 'bg-brand-50/50'}`}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? 'bg-ink-200' : 'bg-brand-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink-800">{n.title}</p>
                      <Badge tone={n.priority === 'Critical' ? 'critical' : n.priority === 'High' ? 'warning' : 'neutral'}>
                        {n.priority}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-ink-400">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
