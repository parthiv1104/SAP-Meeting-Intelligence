import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info };
const TONE = {
  success: 'border-success-500/30 bg-success-50 text-success-600',
  warning: 'border-warning-500/30 bg-warning-50 text-warning-600',
  error: 'border-critical-500/30 bg-critical-50 text-critical-600',
  info: 'border-info-500/30 bg-info-50 text-info-600',
};

export default function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div key={t.id} className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium ${TONE[t.type]} bg-white`}>
            <Icon size={16} />
            <span className="text-ink-800">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-2 text-ink-400 hover:text-ink-600">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
