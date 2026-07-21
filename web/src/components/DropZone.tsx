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
            ? 'border-accent bg-surface dark:bg-surface-dark'
            : 'bg-surface hover:border-accent dark:bg-surface-dark'
        } ${hasFiles ? 'py-6' : 'py-14'}`}
      >
        <FileUp aria-hidden="true" className="h-6 w-6 text-accent" strokeWidth={1.75} />
        <span className="text-sm text-ink dark:text-ink-dark">
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
          className="pointer-events-none fixed inset-2 z-50 rounded-m border-2 border-accent"
        />
      )}
    </>
  );
}
