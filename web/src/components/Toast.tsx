import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastData {
  kind: 'info' | 'error';
  message: string;
}

export function Toast({ kind, message, onClose }: ToastData & { onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [message, onClose]);

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-4 max-w-sm rounded bg-surface px-4 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-l-4 ${
        kind === 'error' ? 'border-l-danger text-danger' : 'border-l-amber text-ink dark:border-l-amber-dark dark:text-ink-dark'
      } dark:bg-surface-dark animate-in slide-in-from-bottom-5 fade-in duration-300`}
    >
      <span className="font-medium flex-1 leading-snug">
        {message}
      </span>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
