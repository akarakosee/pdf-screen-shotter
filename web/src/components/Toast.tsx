import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastData {
  kind: 'info' | 'error';
  message: string;
}

export interface ToastProps {
  toast?: ToastData | null;
  data?: ToastData | null;
  kind?: 'info' | 'error';
  message?: string;
  onClear?: () => void;
  onDismiss?: () => void;
  onClose?: () => void;
}

export function Toast(props: ToastProps) {
  const toastObj = props.toast || props.data || (props.message ? { kind: props.kind || 'info', message: props.message } : null);
  const handleClose = props.onClose || props.onClear || props.onDismiss || (() => {});

  useEffect(() => {
    if (!toastObj) return;
    const id = setTimeout(handleClose, 5000);
    return () => clearTimeout(id);
  }, [toastObj, handleClose]);

  if (!toastObj || !toastObj.message) {
    return null;
  }

  const { kind, message } = toastObj;

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
        type="button"
        onClick={handleClose} 
        className="flex-shrink-0 text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
