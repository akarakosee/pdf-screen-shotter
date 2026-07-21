// Toast: info · error. Bottom-right, 4s, at most one at a time.

import { useEffect } from 'react';

export interface ToastData {
  kind: 'info' | 'error';
  message: string;
}

export function Toast({ toast, onClear }: { toast: ToastData | null; onClear: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onClear, 4000);
    return () => clearTimeout(id);
  }, [toast, onClear]);

  if (!toast) return null;
  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-4 right-4 z-50 max-w-xs rounded-s border bg-surface px-4 py-3 text-xs shadow-2 dark:bg-surface-dark ${
        toast.kind === 'error' ? 'text-danger' : 'text-ink dark:text-ink-dark'
      }`}
    >
      {toast.message}
    </div>
  );
}
