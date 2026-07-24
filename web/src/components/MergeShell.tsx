// MergeShell — upload → reorder → processing → done state machine for
// /merge-pdf. Deliberately separate from ToolShell: merge's data flow
// (N PDFs → 1 merged PDF) shares no DPI/page-range/raster-preview concerns
// with the pdf-to-png/pdf-to-jpg export tools. See
// docs/superpowers/specs/2026-07-23-merge-pdf-design.md for the full design
// rationale (ADR-008 covers the worker protocol addition).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { reasonText } from '../app/fileErrors';
import { validatePdfFile } from '../app/validators';
import type { MergeResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en, fmt } from '../i18n/en';
import { Button } from './ui/Button';
import { DropZone } from './DropZone';
import { FileChip, type ChipData } from './FileChip';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';

type Phase = 'upload' | 'reorder' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

let nextId = 0;
const newId = () => `m${++nextId}`;

export function MergeShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [chips, setChips] = useState<ChipData[]>([]);
  const filesRef = useRef(new Map<string, File>());
  const [cancelling, setCancelling] = useState(false);
  const [mergeProgress, setMergeProgress] = useState<{ fileIndex: number; totalFiles: number } | null>(
    null,
  );
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setChips((cs) => cs.map((c) => (c.id === fileId ? { ...c, pageCount } : c)));
        },
        onFileError: (fileId, message) => {
          setChips((cs) =>
            cs.map((c) =>
              c.id === fileId ? { ...c, status: 'failed', reason: reasonText(message, t) } : c,
            ),
          );
        },
        onMergeProgress: (fileIndex, totalFiles) => setMergeProgress({ fileIndex, totalFiles }),
        onMergeDone: (result) => {
          setMergeResult(result);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile });
          setPhase((p) => (p === 'processing' ? 'reorder' : p));
        },
        onUnavailable: () => setUnavailable(true),
      });
    }
    return controllerRef.current;
  }, [t]);

  useEffect(() => {
    if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined') setWasmOk(false);
    return () => controllerRef.current?.dispose();
  }, []);

  const preload = useCallback(() => controller().preload(), [controller]);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const added: ChipData[] = [];
      for (const file of incoming) {
        const rejection = await validatePdfFile(file);
        const id = newId();
        if (rejection) {
          added.push({
            id,
            name: file.name,
            size: file.size,
            pageCount: null,
            status: 'invalid',
            reason: rejection === 'empty-file' ? t.emptyFile : t.notPdf,
          });
        } else {
          filesRef.current.set(id, file);
          added.push({ id, name: file.name, size: file.size, pageCount: null, status: 'valid' });
          void controller().inspect(id, file);
        }
      }
      setChips((cs) => [...cs, ...added]);
      setPhase((p) => (p === 'upload' ? 'reorder' : p));
    },
    [controller, t],
  );

  const removeFile = useCallback((id: string) => {
    filesRef.current.delete(id);
    setChips((cs) => {
      const next = cs.filter((c) => c.id !== id);
      if (!next.some((c) => c.status === 'valid')) setPhase('upload');
      return next;
    });
  }, []);

  // Tracks DOM elements for each chip by id, used to measure dynamic height
  const chipRefsMap = useRef(new Map<string, HTMLLIElement>());

  // --- Pointer-based Drag-to-Reorder ---
  interface DragState {
    id: string;
    startIndex: number;
    currentIndex: number;
    startY: number;
    offsetY: number;
    chipHeight: number;
    maxIndex: number;
    minOffsetY: number;
    maxOffsetY: number;
    isDropping?: boolean;
    isSynthetic?: boolean;
  }

  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const validChips = chips.filter((c) => c.status === 'valid');
  const invalidChips = chips.filter((c) => c.status !== 'valid');
  const canMerge = validChips.length >= 2;
  const displayList = [...validChips, ...invalidChips];

  const moveChip = useCallback((id: string, dir: -1 | 1) => {
    if (dragRef.current) return; // Prevent button clicks while a drag/drop is active

    // Map the button click (which moves up/down in the valid chips array)
    // to the absolute displayList index.
    const idx = displayList.findIndex((c) => c.id === id);
    const validIdx = validChips.findIndex((c) => c.id === id);
    if (idx < 0 || validIdx < 0) return;
    
    const targetValidIdx = validIdx + dir;
    if (targetValidIdx < 0 || targetValidIdx >= validChips.length) return;
    
    const targetId = validChips[targetValidIdx]!.id;
    const targetIdx = displayList.findIndex((c) => c.id === targetId);

    const el = chipRefsMap.current.get(id);
    if (!el) return;
    const h = el.getBoundingClientRect().height + 8; // 8px = gap-2

    const minOffsetY = -(idx * h);
    const maxOffsetY = (displayList.length - idx) * h;

    // Phase 1: Synthesize a drag start at the element's current position.
    const state: DragState = {
      id,
      startIndex: idx,
      currentIndex: idx,
      startY: 0,
      offsetY: 0,
      chipHeight: h,
      maxIndex: validChips.length - 1,
      minOffsetY,
      maxOffsetY,
      isDropping: false,
      isSynthetic: true,
    };
    
    dragRef.current = state;
    setDragState(state);

    // Phase 2: Wait for React to mount the "drag active" state, then trigger a drop.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Move to the target slot and trigger the smooth drop transition
        const dropState = {
          ...state,
          currentIndex: targetIdx,
          offsetY: (targetIdx - idx) * h,
          isDropping: true,
        };
        dragRef.current = dropState;
        setDragState(dropState);

        // Phase 3: Wait for the CSS transition to finish, then snap DOM state.
        setTimeout(() => {
          if (dragRef.current?.id === id && dragRef.current?.isDropping) {
            setChips((cs) => {
              const valids = cs.filter((c) => c.status === 'valid');
              const invalids = cs.filter((c) => c.status !== 'valid');
              const [moved] = valids.splice(idx, 1);
              if (moved) valids.splice(targetIdx, 0, moved);
              return [...valids, ...invalids];
            });
            dragRef.current = null;
            setDragState(null);
          }
        }, 300);
      });
    });
  }, [displayList, validChips]);

  const startDrag = useCallback(
    (chipId: string, e: React.PointerEvent<HTMLDivElement>) => {
      if (dragRef.current?.isDropping) return; // Prevent grab while another is dropping

      const idx = displayList.findIndex((c) => c.id === chipId);
      if (idx < 0 || displayList[idx]?.status !== 'valid') return;

      const el = chipRefsMap.current.get(chipId);
      if (!el) return;
      const h = el.getBoundingClientRect().height + 8; // 8px = gap-2

      // Clamp boundaries: from the top of the 1st chip (index 0) 
      // to the bottom of the "+" button (index = displayList.length)
      const minOffsetY = -(idx * h);
      const maxOffsetY = (displayList.length - idx) * h;

      const state: DragState = {
        id: chipId,
        startIndex: idx,
        currentIndex: idx,
        startY: e.clientY,
        offsetY: 0,
        chipHeight: h,
        maxIndex: validChips.length - 1,
        minOffsetY,
        maxOffsetY,
        isDropping: false,
        isSynthetic: false,
      };
      dragRef.current = state;
      setDragState(state);
    },
    [displayList, validChips.length],
  );

  // Document-level move/up listeners — only mounted while dragging.
  // All mutable state is read via dragRef to avoid stale closures.
  const isDragActive = dragState !== null;
  useEffect(() => {
    if (!isDragActive) return;

    const onMove = (e: PointerEvent) => {
      const prev = dragRef.current;
      if (!prev || prev.isDropping) return;
      
      let offsetY = e.clientY - prev.startY;
      // Clamp visually within the strict bounds of the list container
      offsetY = Math.max(prev.minOffsetY, Math.min(prev.maxOffsetY, offsetY));

      const delta = Math.round(offsetY / prev.chipHeight);
      const currentIndex = Math.max(0, Math.min(prev.maxIndex, prev.startIndex + delta));
      const next = { ...prev, offsetY, currentIndex };
      dragRef.current = next;
      setDragState(next);
    };

    const onUp = () => {
      const ds = dragRef.current;
      if (!ds || ds.isDropping) return;

      // Animate to final resting position
      const targetOffsetY = (ds.currentIndex - ds.startIndex) * ds.chipHeight;
      const dropState = { ...ds, offsetY: targetOffsetY, isDropping: true };
      
      dragRef.current = dropState;
      setDragState(dropState);

      // Wait for the drop animation to finish before snapping real DOM
      setTimeout(() => {
        // Double check we are still the active drop (safety)
        if (dragRef.current?.id === ds.id) {
          if (ds.startIndex !== ds.currentIndex) {
            setChips((cs) => {
              const valids = cs.filter((c) => c.status === 'valid');
              const invalids = cs.filter((c) => c.status !== 'valid');
              const [moved] = valids.splice(ds.startIndex, 1);
              if (moved) valids.splice(ds.currentIndex, 0, moved);
              return [...valids, ...invalids];
            });
          }
          dragRef.current = null;
          setDragState(null);
        }
      }, 300); // 300ms matches the drop transition duration
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    
    // Prevent text selection and force grabbing cursor on the whole body during drag
    const originalUserSelect = document.body.style.userSelect;
    const originalCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = originalUserSelect;
      document.body.style.cursor = originalCursor;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragActive]);

  // Compute inline styles for each chip during an active drag.
  // Using independent 'translate' and 'scale' CSS properties so they don't
  // get overridden by the 'transform' defined in the 'chip-enter' animation keyframes.
  const getChipDragStyle = (chipIndex: number): React.CSSProperties | undefined => {
    if (!dragState) return undefined;

    if (chipIndex === dragState.startIndex) {
      // The dragged chip
      const isDropping = dragState.isDropping;
      return {
        translate: `0 ${dragState.offsetY}px`,
        scale: isDropping ? '1' : '1.02',
        zIndex: 50,
        position: 'relative',
        boxShadow: isDropping 
          ? 'none' 
          : '0 20px 40px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(232,182,95,0.5)',
        transition: isDropping 
          ? 'translate 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, scale 300ms ease'
          : 'box-shadow 200ms ease, scale 200ms ease',
      };
    }

    // Non-dragged chips: shift to make room
    let shift = 0;
    const { startIndex, currentIndex, chipHeight } = dragState;
    if (currentIndex > startIndex) {
      // Dragging down — chips between start+1..current shift up
      if (chipIndex > startIndex && chipIndex <= currentIndex) {
        shift = -chipHeight;
      }
    } else if (currentIndex < startIndex) {
      // Dragging up — chips between current..start-1 shift down
      if (chipIndex >= currentIndex && chipIndex < startIndex) {
        shift = chipHeight;
      }
    }

    return {
      translate: `0 ${shift}px`,
      transition: 'translate 400ms cubic-bezier(0.22, 1, 0.36, 1)',
    };
  };

  const merge = useCallback(() => {
    if (!canMerge) return;
    setMergeProgress(null);
    setPhase('processing');
    void controller().mergeFiles(
      validChips.map((c) => ({ fileId: c.id, file: filesRef.current.get(c.id)! })),
    );
  }, [canMerge, controller, validChips]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
  }, [controller]);

  const reset = useCallback(() => {
    filesRef.current.clear();
    setChips([]);
    setMergeResult(null);
    setMergeProgress(null);
    setPhase('upload');
  }, []);

  if (!wasmOk) {
    return (
      <div className="rounded-m border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.noWasm}</p>
        {desktopAppUrl && (
          <p className="mt-2 text-xs">
            <a href={desktopAppUrl} className="underline underline-offset-2 text-accent">
              {t.desktopAppLink}
            </a>
          </p>
        )}
      </div>
    );
  }

  if (unavailable) {
    return (
      <div role="alert" className="rounded-m border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.toolUnavailable}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-s border bg-surface px-4 text-sm font-medium hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
          >
            {t.reloadPage}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <>
          <DropZone t={t} hasFiles={chips.length > 0} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </>
      )}

      {phase === 'reorder' && (
        <div className="phase-enter flex flex-col gap-4">
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark">{t.mergeOrderHint}</p>
          <ul className="flex flex-col gap-2">
            {displayList.map((c, i) => {
              const validIndex = validChips.findIndex((v) => v.id === c.id);
              const isDragging = dragState?.id === c.id && !dragState.isSynthetic;
              
              // We pass the absolute index in the displayList for the drag style computation
              return (
                <FileChip
                  key={c.id}
                  t={t}
                  data={c}
                  enterDelay={i * 40}
                  onRemove={removeFile}
                  onMoveUp={c.status === 'valid' ? () => moveChip(c.id, -1) : undefined}
                  onMoveDown={c.status === 'valid' ? () => moveChip(c.id, 1) : undefined}
                  canMoveUp={validIndex > 0}
                  canMoveDown={validIndex >= 0 && validIndex < validChips.length - 1}
                  chipRef={(el) => {
                    if (el) chipRefsMap.current.set(c.id, el);
                    else chipRefsMap.current.delete(c.id);
                  }}
                  onDragHandlePointerDown={c.status === 'valid' ? (e) => startDrag(c.id, e) : undefined}
                  isDragging={isDragging}
                  dragStyle={getChipDragStyle(i)}
                />
              );
            })}
            <li className="flex">
              <button
                type="button"
                onClick={() => addFileInputRef.current?.click()}
                aria-label={t.addFile}
                title={t.addFile}
                className="btn-motion flex h-full min-h-[58px] w-full items-center justify-center gap-2 rounded-s border border-dashed border-amber/60 bg-gradient-to-br from-amber/10 to-[#F0C778]/20 text-amber shadow-[0_0_15px_rgba(232,182,95,0.15)] transition-all duration-200 hover:border-amber hover:from-amber/20 hover:to-[#F0C778]/30 hover:shadow-[0_0_20px_rgba(232,182,95,0.4)] dark:border-amber-dark/60 dark:from-amber-dark/20 dark:to-[#F0C778]/20 dark:text-amber-400 dark:hover:from-amber-dark/30 dark:hover:to-[#F0C778]/30"
              >
                <Plus aria-hidden="true" className="h-6 w-6" strokeWidth={2.25} />
              </button>
              <input
                ref={addFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  const incoming = e.currentTarget.files;
                  if (incoming && incoming.length > 0) void addFiles([...incoming]);
                  e.currentTarget.value = '';
                }}
              />
            </li>
          </ul>
          {!canMerge && <p className="text-xs text-danger">{t.mergeMinFiles}</p>}
          <div className="flex justify-end">
            <Button onClick={merge} disabled={!canMerge}>
              {t.convert}
            </Button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3" aria-live="polite">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>
              {mergeProgress
                ? fmt(t.progressFile, { i: mergeProgress.fileIndex, n: mergeProgress.totalFiles })
                : t.converting}
            </span>
            <span className="font-mono">
              {mergeProgress
                ? Math.round((mergeProgress.fileIndex / mergeProgress.totalFiles) * 100)
                : 0}
              %
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={
              mergeProgress ? Math.round((mergeProgress.fileIndex / mergeProgress.totalFiles) * 100) : 0
            }
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1 overflow-hidden rounded-s bg-surface dark:bg-surface-dark border"
          >
            <div
              className="progress-fill h-full w-full"
              style={{
                transform: `scaleX(${
                  mergeProgress ? mergeProgress.fileIndex / mergeProgress.totalFiles : 0
                })`,
              }}
            />
          </div>
          <div>
            <Button variant="secondary" onClick={cancel} disabled={cancelling}>
              {cancelling ? t.cancelling : t.cancel}
            </Button>
          </div>
        </div>
      )}

      {phase === 'done' && mergeResult && (
        <div className="card-lit flex flex-col items-start gap-3 rounded-s border bg-surface p-5 dark:bg-surface-dark">
          <p className="text-sm font-medium">{t.doneTitle}</p>
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
            {fmt(t.mergeResultSummary, { n: mergeResult.mergedFiles, pages: mergeResult.totalPages })}
          </p>
          {mergeResult.output && mergeResult.outputName && (
            <Button onClick={() => triggerDownload(mergeResult.output!, mergeResult.outputName!)}>
              {t.mergeDownload}
            </Button>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-sm text-accent underline underline-offset-2"
          >
            {t.mergeMore}
          </button>
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
