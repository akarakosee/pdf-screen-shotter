// FileChip: queued · valid · invalid · processing · done · failed.
// File name in mono; size + page count; remove (×) with a 44px hit area.

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
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
  thumbnailUrl?: string; // ADR-007: first-page filmstrip thumbnail, once loaded
  thumbnailBytes?: number; // same thumbnail's blob size — used for the output-size estimate
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileChip({
  t,
  data,
  onRemove,
  enterDelay = 0,
  isActive = false,
  hasError = false,
  onClick,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  chipRef,
  className: extraClassName,
  onDragHandlePointerDown,
  isDragging = false,
  dragStyle,
}: {
  t: Strings;
  data: ChipData;
  onRemove?: (id: string) => void;
  enterDelay?: number; // ms — 40ms per-chip stagger when a multi-file drop lands (ADR-005)
  isActive?: boolean;
  hasError?: boolean;
  onClick?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  chipRef?: (el: HTMLLIElement | null) => void; // FLIP animation ref callback
  className?: string; // extra classes for animation states
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  dragStyle?: React.CSSProperties;
}) {
  const isFailed = data.status === 'invalid' || data.status === 'failed';
  
  // Freeze the initial delay so it doesn't change on reorder
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), (enterDelay || 0) + 600);
    return () => clearTimeout(timer);
  }, [enterDelay]);

  return (
    <li
      ref={chipRef}
      style={{
        ...(!hasEntered && enterDelay > 0 ? { animationDelay: `${enterDelay}ms` } : {}),
        ...dragStyle,
      }}
      className={`${!hasEntered ? 'chip-enter ' : ''}relative flex items-center gap-3 rounded-lg border px-3 py-2 ${
        isDragging
          ? 'border-amber bg-gradient-to-r from-amber/15 to-[#F0C778]/10 dark:border-amber-dark dark:from-amber-dark/25 dark:to-transparent'
          : isFailed
            ? 'card-lit border-danger/40 bg-surface dark:bg-surface-dark'
            : hasError
              ? 'border-danger bg-gradient-to-r from-danger/10 to-danger/5 shadow-[0_0_15px_rgba(220,38,38,0.25)] dark:from-danger/20 dark:to-transparent'
              : isActive
                ? 'border-amber bg-gradient-to-r from-amber/10 to-[#F0C778]/5 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:from-amber-dark/20 dark:to-transparent'
                : 'card-lit bg-surface hover:border-ink-muted/30 dark:bg-surface-dark dark:hover:border-ink-muted-dark/30'
      } ${onClick && !isFailed ? 'cursor-pointer' : ''} ${extraClassName ?? ''}`}
      onClick={!isFailed ? onClick : undefined}
      role={onClick && !isFailed ? 'button' : undefined}
      aria-pressed={isActive}
    >
      {hasError && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 animate-custom-ping rounded-lg border-2 border-danger/60" style={{ animationDelay: '0s' }} />
          <div className="absolute inset-0 animate-custom-ping rounded-lg border-2 border-danger/60" style={{ animationDelay: '0.3s' }} />
          <div className="absolute inset-0 animate-custom-ping rounded-lg border-2 border-danger/60" style={{ animationDelay: '0.6s' }} />
          <div className="absolute inset-0 animate-custom-ping rounded-lg border-2 border-danger/60" style={{ animationDelay: '0.9s' }} />
        </div>
      )}
      {/* Drag handle — only rendered in MergeShell's reorder phase */}
      {onDragHandlePointerDown && !isFailed && (
        <div
          onPointerDown={onDragHandlePointerDown}
          className={`relative z-10 -ml-1 flex shrink-0 cursor-grab items-center self-stretch justify-center rounded px-1 transition-colors duration-150 ${
            isDragging
              ? 'cursor-grabbing text-amber dark:text-amber-dark'
              : 'text-ink-muted/40 hover:text-ink-muted dark:text-ink-muted-dark/40 dark:hover:text-ink-muted-dark'
          }`}
          style={{ touchAction: 'none' }}
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        </div>
      )}
      {!isFailed && data.thumbnailUrl && (
        <img
          src={data.thumbnailUrl}
          alt=""
          aria-hidden="true"
          className="h-10 w-8 shrink-0 rounded-lg border object-contain relative z-10"
        />
      )}
      <div className="min-w-0 flex-1 relative z-10">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-thin font-mono text-xs pr-1" title={data.name}>{data.name}</div>
        <p className={`text-xs ${isFailed || hasError ? 'text-danger' : 'text-ink-muted dark:text-ink-muted-dark'}`}>
          {isFailed
            ? data.reason
            : `${formatSize(data.size)}${
                data.pageCount != null ? ` · ${fmt(t.filePages, { n: data.pageCount })}` : ''
              }`}
        </p>
      </div>
      {!isFailed && (onMoveUp || onMoveDown) && (
        <div className="relative z-10 flex shrink-0 flex-col">
          {onMoveUp && (
            <button
              type="button"
              aria-label={fmt(t.moveFileUp, { name: data.name })}
              disabled={!canMoveUp}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="flex h-5 w-6 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 dark:text-ink-muted-dark dark:hover:text-ink-dark"
            >
              <ChevronUp aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              aria-label={fmt(t.moveFileDown, { name: data.name })}
              disabled={!canMoveDown}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="flex h-5 w-6 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 dark:text-ink-muted-dark dark:hover:text-ink-dark"
            >
              <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={fmt(t.removeFile, { name: data.name })}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(data.id);
          }}
          className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
        >
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </li>
  );
}
