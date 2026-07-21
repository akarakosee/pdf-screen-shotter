// FileChip: queued · valid · invalid · processing · done · failed.
// File name in mono; size + page count; remove (×) with a 44px hit area.

import { X } from 'lucide-react';
import type { Strings } from '../i18n/en';
import { fmt } from '../i18n/en';
import type { FileStatus } from '../core/types';

export interface ChipData {
  id: string;
  name: string;
  size: number;
  pageCount: number | null;
  status: FileStatus;
  reason?: string; // shown for invalid/failed
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileChip({
  t,
  data,
  onRemove,
}: {
  t: Strings;
  data: ChipData;
  onRemove?: (id: string) => void;
}) {
  const bad = data.status === 'invalid' || data.status === 'failed';
  return (
    <li
      className={`flex items-center gap-3 rounded-s border bg-surface px-3 py-2 dark:bg-surface-dark ${
        bad ? 'border-danger/40' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs">{data.name}</p>
        <p className={`text-xs ${bad ? 'text-danger' : 'text-ink-muted dark:text-ink-muted-dark'}`}>
          {bad
            ? data.reason
            : `${formatSize(data.size)}${
                data.pageCount != null ? ` · ${fmt(t.filePages, { n: data.pageCount })}` : ''
              }`}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={fmt(t.removeFile, { name: data.name })}
          onClick={() => onRemove(data.id)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-s text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
        >
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </li>
  );
}
