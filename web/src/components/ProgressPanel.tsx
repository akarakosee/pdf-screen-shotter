// ProgressPanel: running · cancelling. File x/y + page n/m + thin bar.
// Cancel is secondary, never red (not destructive). aria-live="polite".

import type { ProgressData } from '../core/types';
import type { Strings } from '../i18n/en';
import { fmt } from '../i18n/en';
import { Button } from './ui/Button';

interface Props {
  t: Strings;
  progress: ProgressData | null;
  cancelling: boolean;
  onCancel: () => void;
}

export function ProgressPanel({ t, progress, cancelling, onCancel }: Props) {
  const pct =
    progress && progress.totalPages > 0
      ? Math.round((progress.page / progress.totalPages) * 100)
      : 0;
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
        <span>
          {progress
            ? `${fmt(t.progressFile, { i: progress.fileIndex, n: progress.totalFiles })} · ${fmt(
                t.progressPage,
                { i: progress.page, n: progress.totalPages },
              )}`
            : t.converting}
        </span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 overflow-hidden rounded-s bg-surface dark:bg-surface-dark border"
      >
        {/* scaleX keeps the fill on the compositor (ADR-005); the fill color
            softens into a faint amber tail at its leading edge. */}
        <div
          className="progress-fill h-full w-full"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <div>
        <Button variant="secondary" onClick={onCancel} disabled={cancelling}>
          {cancelling ? t.cancelling : t.cancel}
        </Button>
      </div>
    </div>
  );
}
