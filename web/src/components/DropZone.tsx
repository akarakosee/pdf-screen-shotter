// DropZone (UI_UX_TASARIM §3): idle / dragover / has-files / error.
// During drag the WHOLE viewport becomes the drop target (PRD R13) with a
// visible overlay boundary; Esc cancels the drag-over state. Enter/Space
// opens the file picker (keyboard flow, WCAG AA).

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import type { Strings } from '../i18n/en';

interface Props {
  t: Strings;
  hasFiles: boolean;
  onFiles: (files: File[]) => void;
  onPreload: () => void; // hover/dragenter → warm up the WASM
}

export function DropZone({ t, hasFiles, onFiles, onPreload }: Props) {
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const accept = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles([...list]);
    },
    [onFiles],
  );

  // Whole-viewport drop target with explicit exit paths.
  useEffect(() => {
    const enter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragDepth.current++;
      setDragover(true);
      onPreload();
    };
    const over = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
    };
    const leave = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragover(false);
    };
    const drop = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragover(false);
      accept(e.dataTransfer.files);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dragDepth.current = 0;
        setDragover(false);
      }
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
      window.removeEventListener('keydown', esc);
    };
  }, [accept, onPreload]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={t.dropIdle}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onMouseEnter={onPreload}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-m border p-10 text-center transition-colors duration-[200ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          dragover
            ? 'border-amber bg-surface shadow-[0_0_0_3px_rgba(232,182,95,0.15)] dark:border-amber-dark dark:bg-surface-dark'
            : 'dropzone-breathe card-lit bg-surface hover:border-amber dark:bg-surface-dark dark:hover:border-amber-dim-dark'
        } ${hasFiles ? 'py-6' : 'py-14'}`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-[9px] bg-gradient-to-br from-amber to-russet text-[#1D1108] dark:from-amber-dark dark:to-russet">
          <FileUp aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
        </span>
        {/* key remount pops the dragover label in with the spring ease (ADR-005) */}
        <span
          key={dragover ? 'over' : 'idle'}
          className={`text-sm text-ink dark:text-ink-dark ${dragover ? 'pop-in' : ''}`}
        >
          {dragover ? t.dropDragover : t.dropIdle}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            accept(e.currentTarget.files);
            e.currentTarget.value = '';
          }}
        />
      </div>

      {dragover && (
        <div
          aria-hidden="true"
          className="drag-overlay elev-3 pointer-events-none fixed inset-2 z-50 rounded-m border-2 border-amber dark:border-amber-dark"
        />
      )}
    </>
  );
}
