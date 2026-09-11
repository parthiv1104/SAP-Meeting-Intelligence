import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4" onClick={onClose}>
      <div
        className={`w-full ${width} rounded-xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="focus-ring rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
