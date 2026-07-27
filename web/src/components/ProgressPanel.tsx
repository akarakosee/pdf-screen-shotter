import React from 'react';
import { Button } from './ui/Button';

export interface ProgressPanelProps {
  label: string;
  progressPercent: number; // 0 to 100
  onCancel: () => void;
  cancelling: boolean;
  cancelLabel: string;
  cancellingLabel: string;
}

export function ProgressPanel({
  label,
  progressPercent,
  onCancel,
  cancelling,
  cancelLabel,
  cancellingLabel,
}: ProgressPanelProps) {
  return (
    <div className="phase-enter flex flex-col gap-3" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
        <span>{label}</span>
        <span className="font-mono">{Math.round(progressPercent)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 overflow-hidden rounded-lg bg-surface dark:bg-surface-dark border"
      >
        <div
          className="progress-fill h-full w-full"
          style={{
            transform: `scaleX(${progressPercent / 100})`,
          }}
        />
      </div>
      <div>
        <Button variant="secondary" onClick={onCancel} disabled={cancelling}>
          {cancelling ? cancellingLabel : cancelLabel}
        </Button>
      </div>
    </div>
  );
}
