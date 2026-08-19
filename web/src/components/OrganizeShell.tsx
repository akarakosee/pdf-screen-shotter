import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { PDFDocument } from 'pdf-lib';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { OrganizeResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Button } from './ui/Button';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { PageCard } from './PageCard';
import { ProgressPanel } from './ProgressPanel';
import { RotateCcw, RotateCw, Trash2, Download, Check, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'grid' | 'processing' | 'done';

interface OrganizePageData {
  id: string;
  originalPage: number;
  rotation: number;
  isDeleting?: boolean;
}

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
  mode?: 'organize' | 'rotate' | 'remove';
}

function SortableItem(props: {
  pageData: OrganizePageData;
  index: number;
  file: File;
  controller: JobController;
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  isDraggingAny: boolean;
  mode?: 'organize' | 'rotate' | 'remove';
}) {
  const { pageData, index, file, controller, onRotateLeft, onRotateRight, onRemove, isSelected, onToggleSelect, isDraggingAny, mode = 'organize' } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pageData.id, disabled: mode === 'rotate' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  const onBtnClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onToggleSelect();
      }}
      className={`relative group touch-manipulation ${mode === 'rotate' ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${isDraggingAny || pageData.isDeleting ? 'pointer-events-none' : ''}`}
    >
      <div className={`transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${pageData.isDeleting ? 'opacity-0 scale-50 -translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
        <PageCard
          page={pageData.originalPage}
          file={file}
          controller={controller}
          index={index}
          rotation={pageData.rotation}
          badgeText={index + 1}
          isSelected={isSelected}
        >
          {mode !== 'rotate' && (
            <div className={`absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity duration-300 ${!isDraggingAny ? 'group-hover:opacity-100' : ''}`}>
              <button
                onClick={(e) => onBtnClick(e, () => onRemove(pageData.id))}
                className="p-1.5 rounded-md bg-danger/90 text-white shadow-lg hover:bg-danger hover:scale-110 active:scale-95 transition-all"
                title="Remove Page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {mode !== 'remove' && (
            <div className={`absolute bottom-2 left-2 flex gap-1 opacity-0 transition-opacity duration-300 ${!isDraggingAny ? 'group-hover:opacity-100' : ''}`}>
              <button
                onClick={(e) => onBtnClick(e, () => onRotateLeft(pageData.id))}
                className="p-1.5 rounded-md bg-surface/90 dark:bg-ink/90 text-ink dark:text-surface shadow-lg hover:bg-surface dark:hover:bg-ink hover:text-amber dark:hover:text-amber-dark transition-all"
                title="Rotate Left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => onBtnClick(e, () => onRotateRight(pageData.id))}
                className="p-1.5 rounded-md bg-surface/90 dark:bg-ink/90 text-ink dark:text-surface shadow-lg hover:bg-surface dark:hover:bg-ink hover:text-amber dark:hover:text-amber-dark transition-all"
                title="Rotate Right"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </PageCard>
      </div>
    </div>
  );
}

export function OrganizeShell({ t = en, desktopAppUrl, mode = 'organize' }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<{ id: string; file: File; pageCount: number } | null>(null);
  const [pages, setPages] = useState<OrganizePageData[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [isModified, setIsModified] = useState(false);
  
  const [organizeProgress, setOrganizeProgress] = useState<{ processedPages: number; totalPages: number } | null>(null);
  const [organizeResult, setOrganizeResult] = useState<OrganizeResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selection & Drag overlay state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasPerformedAction, setHasPerformedAction] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setFile((prev) => prev?.id === fileId ? { ...prev, pageCount } : prev);
          
          // Initialize pages array
          const initialPages: OrganizePageData[] = Array.from({ length: pageCount }, (_, i) => ({
            id: `p-${i + 1}-${Date.now()}`,
            originalPage: i + 1,
            rotation: 0,
          }));
          setPages(initialPages);
          setIsModified(false);
          setSelectedIds(new Set());
          setHasPerformedAction(false);
          setPhase('grid');
        },
        onFileError: (fileId, message) => {
          setToast({ kind: 'error', message: t.corruptFile });
          setErrorMsg(null);
    setPhase('upload');
        },
        onOrganizeProgress: (processedPages, totalPages) => setOrganizeProgress({ processedPages, totalPages }),
        onOrganizeDone: (result) => {
          setOrganizeResult(result);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile });
          setPhase((p) => (p === 'processing' ? 'grid' : p));
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
      const f = incoming[0];
      if (!f) return;
      
      const rejection = await validatePdfFile(f);
      if (rejection) {
        setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
        return;
      }
      
      const id = 'org1';
      setFile({ id, file: f, pageCount: 0 });
      void controller().inspect(id, f);
    },
    [controller, t]
  );

  const runOrganize = useCallback(() => {
    if (!file) return;
    if (pages.length === 0) {
      setToast({ kind: 'error', message: t.organizeEmpty });
      return;
    }
    
    setPhase('processing');
    setOrganizeProgress({ processedPages: 0, totalPages: pages.length });
    const mappedPages = pages.map((p) => ({ pageIndex: p.originalPage, rotation: p.rotation }));
    
    controller().organizeFiles(file.file, file.id, mappedPages).catch(() => {
      setToast({ kind: 'error', message: t.corruptFile });
      setPhase('grid');
    });
  }, [file, pages, controller, t]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
  }, [controller]);

  const reset = useCallback(() => {
    setFile(null);
    setPages([]);
    setIsModified(false);
    setSelectedIds(new Set());
    setHasPerformedAction(false);
    setOrganizeResult(null);
    setOrganizeProgress(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  const handleRotateLeft = useCallback((id: string) => {
    setIsModified(true);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation - 90) % 360 } : p)));
  }, []);

  const handleRotateRight = useCallback((id: string) => {
    setIsModified(true);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setIsModified(true);
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, isDeleting: true } : p));
    
    setTimeout(() => {
      setPages((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (hasPerformedAction && !next.has(id)) {
        setHasPerformedAction(false);
        return new Set([id]);
      }
      
      if (next.has(id)) next.delete(id);
      else next.add(id);
      
      setHasPerformedAction(false);
      return next;
    });
  }, [hasPerformedAction]);

  const handleBulkRotateLeft = useCallback(() => {
    if (selectedIds.size === 0) return;
    setIsModified(true);
    setHasPerformedAction(true);
    setPages((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, rotation: (p.rotation - 90) % 360 } : p)));
  }, [selectedIds]);

  const handleBulkRotateRight = useCallback(() => {
    if (selectedIds.size === 0) return;
    setIsModified(true);
    setHasPerformedAction(true);
    setPages((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
  }, [selectedIds]);

  const handleBulkRemove = useCallback(() => {
    if (selectedIds.size === 0) return;
    setIsModified(true);
    
    setPages((prev) => prev.map((p) => selectedIds.has(p.id) ? { ...p, isDeleting: true } : p));
    
    setTimeout(() => {
      setPages((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setHasPerformedAction(false);
    }, 300);
  }, [selectedIds]);

  // DnD logic
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setIsModified(true);
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  if (!wasmOk) {
    return (
      <div className="rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
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
      <div role="alert" className="rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.toolUnavailable}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border bg-surface px-4 text-sm font-medium hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
          >
            {t.reloadPage}
          </button>
        </div>
      </div>
    );
  }

  const activePageData = activeId ? pages.find((p) => p.id === activeId) : null;

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'grid' && file && (
        <div className="phase-enter flex flex-col gap-6 pb-24" style={{ perspective: '1000px' }}>
          
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="text-sm font-semibold overflow-x-auto whitespace-nowrap scrollbar-thin pr-2" title={file.file.name}>{file.file.name}</div>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {pages.length} pages {selectedIds.size > 0 ? `(${selectedIds.size} selected)` : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-1 mr-4 bg-surface dark:bg-surface-dark border rounded-xl p-1 shadow-sm">
                  {mode !== 'remove' && (
                    <>
                      <button
                        onClick={handleBulkRotateLeft}
                        className="p-2 rounded-lg hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-colors"
                        title="Rotate Selected Left"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleBulkRotateRight}
                        className="p-2 rounded-lg hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-colors"
                        title="Rotate Selected Right"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {mode === 'organize' && <div className="w-px h-6 bg-border dark:bg-border-dark mx-1" />}
                  {mode !== 'rotate' && (
                    <button
                      onClick={handleBulkRemove}
                      className="p-2 rounded-lg hover:bg-danger/10 hover:text-danger text-ink dark:text-ink-dark transition-colors"
                      title="Remove Selected"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedIds(selectedIds.size === pages.length ? new Set() : new Set(pages.map((p) => p.id)));
                  setHasPerformedAction(false);
                }}
                title={selectedIds.size === pages.length ? t.clearSelection : t.selectAll}
                className={`group relative flex items-center justify-center w-10 h-10 shrink-0 rounded-xl border-2 transition-all duration-300 outline-none ${
                  selectedIds.size === pages.length
                    ? 'border-amber bg-amber text-white dark:border-amber-dark dark:bg-amber-dark shadow-[0_0_20px_rgba(232,182,95,0.6)] scale-105'
                    : 'border-amber bg-surface dark:border-amber-dark dark:bg-surface-dark hover:bg-amber/10 dark:hover:bg-amber-dark/10'
                }`}
              >
                {/* Centered Checkmark */}
                <Check className={`relative z-10 w-6 h-6 transition-transform duration-300 ${selectedIds.size === pages.length ? 'scale-100' : 'scale-0'}`} strokeWidth={4} />
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                {pages.map((pageData, index) => (
                  <SortableItem
                    key={pageData.id}
                    pageData={pageData}
                    index={index}
                    file={file.file}
                    controller={controller()}
                    onRotateLeft={handleRotateLeft}
                    onRotateRight={handleRotateRight}
                    onRemove={handleRemove}
                    isSelected={selectedIds.has(pageData.id)}
                    onToggleSelect={() => toggleSelect(pageData.id)}
                    isDraggingAny={activeId !== null}
                    mode={mode}
                  />
                ))}
              </SortableContext>
            </div>
            
            <DragOverlay
              dropAnimation={defaultDropAnimationSideEffects({
                duration: 250,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              })}
            >
              {activePageData ? (
                <div 
                  className="shadow-[0_0_40px_rgba(232,182,95,0.4)] scale-105 rounded-xl border-amber bg-amber/5"
                >
                  <PageCard
                    page={activePageData.originalPage}
                    file={file.file}
                    controller={controller()}
                    index={0}
                    rotation={activePageData.rotation}
                    badgeText={pages.findIndex(p => p.id === activeId) + 1}
                    isSelected
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className={`
            sticky z-50 bottom-6 mt-8 mx-auto p-2 rounded-2xl border
            bg-white/80 dark:bg-ink/80 backdrop-blur-xl shadow-2xl
            flex gap-2 transition-all duration-500 ease-out transform
            ${isModified 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}
          `}>
            <button
              onClick={runOrganize}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-amber text-white shadow-[0_0_20px_rgba(232,182,95,0.4)] hover:bg-amber-hover hover:shadow-[0_0_30px_rgba(232,182,95,0.6)] dark:bg-amber-dark dark:hover:bg-amber-dark hover:scale-[1.05] active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">
                {mode === 'rotate'
                  ? (t.lang === 'tr' ? 'Döndürülen PDF İndir' : 'Download Rotated PDF')
                  : mode === 'remove'
                  ? (t.lang === 'tr' ? 'Sayfaları Sil ve İndir' : 'Remove Pages & Download')
                  : t.organizeExport}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          label={
            organizeProgress && file?.pageCount
              ? `Processing page ${organizeProgress.processedPages} of ${organizeProgress.totalPages}...`
              : t.converting || 'Processing...'
          }
          progressPercent={
            organizeProgress
              ? (organizeProgress.processedPages / organizeProgress.totalPages) * 100
              : 0
          }
          onCancel={cancel}
          cancelling={cancelling}
          cancelLabel={t.cancel || 'Cancel'}
          cancellingLabel={t.cancelling || 'Cancelling...'}
        />
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={{
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: organizeResult?.output,
              outputName: organizeResult?.outputName,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if (organizeResult?.output) triggerDownload(organizeResult?.output, organizeResult?.outputName); }}
            onConvertMore={reset}
          />
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
