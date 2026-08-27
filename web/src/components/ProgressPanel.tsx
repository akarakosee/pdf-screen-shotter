import React from 'react';
import { Button } from './ui/Button';

export interface ProgressPanelProps {
  label: string;
  progressPercent?: number; // 0 to 100 or undefined for animated loading
  onCancel?: () => void;
  cancelling?: boolean;
  cancelLabel?: string;
  cancellingLabel?: string;
}

export function ProgressPanel({
  label,
  progressPercent,
  onCancel,
  cancelling = false,
  cancelLabel = 'Cancel',
  cancellingLabel = 'Cancelling...',
}: ProgressPanelProps) {
  const isDeterminate = typeof progressPercent === 'number' && !isNaN(progressPercent);

  return (
    <div className="phase-enter flex flex-col gap-3" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
        <span>{label}</span>
        {isDeterminate && <span className="font-mono">{Math.round(progressPercent!)}%</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={isDeterminate ? Math.round(progressPercent!) : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 overflow-hidden rounded-lg bg-surface dark:bg-surface-dark border"
      >
        {isDeterminate ? (
          <div
            className="progress-fill h-full w-full origin-left transition-transform duration-300 ease-out"
            style={{
              transform: `scaleX(${Math.max(0, Math.min(1, progressPercent! / 100))})`,
            }}
          />
        ) : (
          <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
        )}
      </div>
      {onCancel && (
        <div>
          <Button variant="secondary" onClick={onCancel} disabled={cancelling}>
            {cancelling ? cancellingLabel : cancelLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
