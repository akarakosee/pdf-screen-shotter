// MergeShell — upload → reorder → processing → done state machine for
// /merge-pdf. Deliberately separate from ToolShell: merge's data flow
// (N PDFs → 1 merged PDF) shares no DPI/page-range/raster-preview concerns
// with the pdf-to-png/pdf-to-jpg export tools. See
// docs/superpowers/specs/2026-07-23-merge-pdf-design.md for the full design
// rationale (ADR-008 covers the worker protocol addition).

import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Swaps a chip with its neighbor in the given direction. Only ever called
  // for valid chips (see the FileChip wiring below), so no bounds-checking
  // against invalid chips is needed here.
  const moveChip = useCallback((id: string, dir: -1 | 1) => {
    setChips((cs) => {
      const i = cs.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cs.length) return cs;
      const next = [...cs];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }, []);

  const validChips = chips.filter((c) => c.status === 'valid');
  const invalidChips = chips.filter((c) => c.status !== 'valid');
  const canMerge = validChips.length >= 2;

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
            {[...validChips, ...invalidChips].map((c, i) => {
              const validIndex = validChips.findIndex((v) => v.id === c.id);
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
                />
              );
            })}
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
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
            {mergeProgress
              ? fmt(t.progressFile, { i: mergeProgress.fileIndex, n: mergeProgress.totalFiles })
              : t.converting}
          </p>
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
