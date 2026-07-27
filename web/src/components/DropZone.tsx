// DropZone (UI_UX_TASARIM §3): idle / dragover / has-files / error.
// During drag the WHOLE viewport becomes the drop target (PRD R13) with a
// visible overlay boundary; Esc cancels the drag-over state. Enter/Space
// opens the file picker (keyboard flow, WCAG AA).

import { useCallback, useEffect, useRef, useState, useId } from 'react';
import { FileUp } from 'lucide-react';
import type { Strings } from '../i18n/en';

interface Props {
  t: Strings;
  hasFiles: boolean;
  onFiles: (files: File[]) => void;
  onPreload?: () => void; // hover/dragenter → warm up the WASM
  multiple?: boolean;
  /** File input accept attribute — defaults to PDF-only. Image tools
   * (img-to-pdf) pass their own so the shared chrome/animations stay
   * identical across every tool while accepting the right file types. */
  accept?: string;
  /** Overrides the idle-state label (defaults to t.dropIdle, "Drop PDFs here"). */
  idleLabel?: string;
  /** Overrides the small caption under the label. */
  sublabel?: string;
}

export function DropZone({
  t,
  hasFiles,
  onFiles,
  onPreload = () => {},
  multiple = true,
  accept = '.pdf,application/pdf',
  idleLabel,
  sublabel = 'or click here to browse files',
}: Props) {
  const inputId = useId();
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const label = idleLabel ?? t.dropIdle;

  const acceptFiles = useCallback(
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
      acceptFiles(e.dataTransfer.files);
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
  }, [acceptFiles, onPreload]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
        }}
        onChange={(e) => {
          acceptFiles(e.currentTarget.files);
          e.currentTarget.value = '';
        }}
      />
      <label
        htmlFor={inputId}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          onPreload();
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed p-10 py-[140px] text-center transition-all duration-300 ease-out ${
          dragover
            ? 'border-amber bg-gradient-to-b from-amber/10 to-[#F0C778]/5 shadow-[0_0_40px_rgba(232,182,95,0.15)] dark:border-amber-dark dark:from-amber-dark/20 dark:to-transparent'
            : 'border-ink-muted/20 bg-surface/50 hover:border-amber/50 hover:bg-surface dark:border-ink-muted-dark/20 dark:bg-surface-dark/50 dark:hover:border-amber-dark/50 dark:hover:bg-surface-dark'
        }`}
      >
        {(isHovered || dragover) && <div className="glow-border-beam" />}
        {isHovered && !dragover && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 animate-dropzone-ping rounded-xl border-2 border-amber/60 dark:border-amber-dark/60" style={{ animationDelay: '0s' }} />
            <div className="absolute inset-0 animate-dropzone-ping rounded-xl border-2 border-amber/60 dark:border-amber-dark/60" style={{ animationDelay: '0.4s' }} />
            <div className="absolute inset-0 animate-dropzone-ping rounded-xl border-2 border-amber/60 dark:border-amber-dark/60" style={{ animationDelay: '0.8s' }} />
            <div className="absolute inset-0 animate-dropzone-ping rounded-xl border-2 border-amber/60 dark:border-amber-dark/60" style={{ animationDelay: '1.2s' }} />
          </div>
        )}
        <div className="relative flex items-center justify-center z-10">
          {isHovered && !dragover && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 animate-custom-ping rounded-2xl border-[3px] border-amber/60 blur-[2px] dark:border-amber-dark/60" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 animate-custom-ping rounded-2xl border-[3px] border-amber/60 blur-[2px] dark:border-amber-dark/60" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-0 animate-custom-ping rounded-2xl border-[3px] border-amber/60 blur-[2px] dark:border-amber-dark/60" style={{ animationDelay: '0.6s' }} />
              <div className="absolute inset-0 animate-custom-ping rounded-2xl border-[3px] border-amber/60 blur-[2px] dark:border-amber-dark/60" style={{ animationDelay: '0.9s' }} />
            </div>
          )}
          {dragover && (
            <div className="absolute inset-0 animate-ping rounded-2xl bg-amber/30 dark:bg-amber-dark/30" />
          )}
          <span className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-russet text-[#1D1108] shadow-lg transition-transform duration-300 dark:from-amber-dark dark:to-russet ${dragover ? 'scale-110' : 'group-hover:scale-105'}`}>
            <FileUp aria-hidden="true" className="h-8 w-8" strokeWidth={1.75} />
          </span>
        </div>
        {/* key remount pops the dragover label in with the spring ease (ADR-005) */}
        <div className="relative z-10 flex flex-col gap-1">
          <span
            key={dragover ? 'over' : 'idle'}
            className={`text-lg font-medium text-ink dark:text-ink-dark ${dragover ? 'pop-in text-amber dark:text-amber-dark' : ''}`}
          >
            {dragover ? t.dropDragover : label}
          </span>
          <span className={`text-sm text-ink-muted transition-opacity duration-300 dark:text-ink-muted-dark ${dragover ? 'opacity-0' : 'opacity-100'}`}>
            {sublabel}
          </span>
        </div>
      </label>
    </>
  );
}
