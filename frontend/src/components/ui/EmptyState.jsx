import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-ink-200 text-ink-400">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-800">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
