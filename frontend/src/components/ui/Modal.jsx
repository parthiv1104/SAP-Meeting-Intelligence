import { X } from 'lucide-react';

export default function Modal({ open, isOpen, onClose, title, children, footer, width = 'max-w-lg' }) {
  const isVisible = open !== undefined ? open : isOpen;
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-xs px-4" onClick={onClose}>
      <div
        className={`w-full ${width} rounded-xl bg-white shadow-2xl border border-ink-100 transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="text-base font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="focus-ring rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3 bg-ink-50/50">{footer}</div>}
      </div>
    </div>
  );
}
