import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, Trash2, Plus, Download, RefreshCw, Check } from 'lucide-react';
import { validateImageFile } from '../app/validators';
import { buildPdfFromImages, type ImgToPdfOptions, type PageSizePreset, type Orientation } from '../engine/imgToPdf';
import { Button } from './ui/Button';
import { ProgressPanel } from './ProgressPanel';
import { PrivacyLine } from './PrivacyLine';
import { DropZone } from './DropZone';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';

interface ImgItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface SortableImgItemProps {
  item: ImgItem;
  index: number;
  total: number;
  frozen: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  t: Strings;
}

function SortableImgItem({
  item,
  index,
  total,
  frozen,
  onMoveUp,
  onMoveDown,
  onRemove,
  t,
}: SortableImgItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    animationDelay: frozen ? undefined : `${index * 40}ms`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex flex-col items-center justify-between rounded-xl border bg-surface p-3 transition-all duration-300 dark:bg-surface-dark ${
        frozen ? '' : 'chip-enter'
      } ${
        isDragging
          ? 'scale-[1.02] border-amber bg-gradient-to-b from-amber/15 to-transparent shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark dark:from-amber-dark/25'
          : 'border-ink-muted/20 hover:border-amber/50 hover:shadow-md dark:border-ink-muted-dark/20 dark:hover:border-amber-dark/50'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-surface-2 dark:bg-surface-2-dark">
        <img
          src={item.previewUrl}
          alt={item.file.name}
          className="max-h-full max-w-full object-contain"
        />
        <span className="absolute left-2 top-2 rounded-md bg-surface/90 px-2 py-0.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm dark:bg-surface-dark/90 dark:text-ink-dark">
          #{index + 1}
        </span>
      </div>

      {/* File name & size */}
      <div className="w-full text-center">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-xs font-medium text-ink pr-1 dark:text-ink-dark" title={item.file.name}>
          {item.file.name}
        </div>
        <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
          {(item.file.size / 1024).toFixed(0)} KB
        </p>
      </div>

      {/* Controls */}
      <div className="mt-3 flex w-full items-center justify-between border-t border-ink-muted/20 pt-2 dark:border-ink-muted-dark/20">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-surface-2-dark dark:hover:text-ink-dark"
            title={t.moveFileUp.replace('{name}', item.file.name)}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === total - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-surface-2-dark dark:hover:text-ink-dark"
            title={t.moveFileDown.replace('{name}', item.file.name)}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger"
          title={t.removeFile.replace('{name}', item.file.name)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function ImgToPdfShell({ t = en, desktopAppUrl }: Props) {
  const [items, setItems] = useState<ImgItem[]>([]);
  const [phase, setPhase] = useState<'upload' | 'grid' | 'processing' | 'done'>('upload');
  const [frozen, setFrozen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Options
  const [pageSize, setPageSize] = useState<PageSizePreset>('fit');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [marginPt, setMarginPt] = useState<number>(0);

  // Result
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string>('converted.pdf');
  const [durationMs, setDurationMs] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Freeze enter animation after initial layout
  useEffect(() => {
    if (items.length > 0 && !frozen) {
      const timer = setTimeout(() => setFrozen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [items.length, frozen]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);

    const newItems: ImgItem[] = [];
    for (const file of files) {
      const rej = await validateImageFile(file);
      if (rej) {
        setErrorMessage(`Invalid image format: ${file.name}`);
        continue;
      }
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setPhase('grid');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => arrayMove(prev, index, index - 1));
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => arrayMove(prev, index, index + 1));
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => {
        if (item.id === id) {
          URL.revokeObjectURL(item.previewUrl);
          return false;
        }
        return true;
      });
      if (next.length === 0) setPhase('upload');
      return next;
    });
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setPhase('processing');
    setErrorMessage(null);

    try {
      const files = items.map((i) => i.file);
      const res = await buildPdfFromImages(files, {
        pageSize,
        orientation,
        marginPt,
      });

      setResultBlob(res.output);
      setResultName(res.outputName);
      setDurationMs(res.durationMs);
      setPhase('done');
    } catch (err) {
      console.error('Conversion error:', err);
      setErrorMessage('Failed to convert images to PDF. Please check your image files.');
      setPhase('grid');
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setResultBlob(null);
    setPhase('upload');
    setFrozen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-danger/50 bg-danger/10 p-4 text-center text-sm font-medium text-danger animate-custom-ping">
          {errorMessage}
        </div>
      )}

      {phase === 'upload' && (
        <>
          <DropZone
            t={t}
            hasFiles={false}
            onFiles={handleFiles}
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            idleLabel={t.imgToPdfDropIdle}
            sublabel={t.imgToPdfDropSublabel}
          />
          <PrivacyLine t={t} />
        </>
      )}

      {phase === 'grid' && (
        <div className="flex flex-col gap-8">
          {/* Options Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-muted/20 bg-surface p-4 shadow-sm dark:border-ink-muted-dark/20 dark:bg-surface-dark">
            <div className="flex flex-wrap items-center gap-6">
              {/* Page Size */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">{t.imgToPdfPageSize}</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizePreset)}
                  className="rounded-lg border border-ink-muted/20 bg-surface px-3 py-1.5 text-xs font-medium text-ink outline-none transition-colors focus:border-amber dark:border-ink-muted-dark/20 dark:bg-surface-dark dark:text-ink-dark dark:focus:border-amber-dark"
                >
                  <option value="fit">{t.imgToPdfFit}</option>
                  <option value="a4">{t.imgToPdfA4}</option>
                  <option value="letter">{t.imgToPdfLetter}</option>
                </select>
              </div>

              {/* Orientation (only when not 'fit') */}
              {pageSize !== 'fit' && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">{t.imgToPdfOrientation}</span>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as Orientation)}
                    className="rounded-lg border border-ink-muted/20 bg-surface px-3 py-1.5 text-xs font-medium text-ink outline-none transition-colors focus:border-amber dark:border-ink-muted-dark/20 dark:bg-surface-dark dark:text-ink-dark dark:focus:border-amber-dark"
                  >
                    <option value="auto">{t.imgToPdfAuto}</option>
                    <option value="portrait">{t.imgToPdfPortrait}</option>
                    <option value="landscape">{t.imgToPdfLandscape}</option>
                  </select>
                </div>
              )}

              {/* Margin */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">{t.imgToPdfMargin}</span>
                <select
                  value={marginPt}
                  onChange={(e) => setMarginPt(Number(e.target.value))}
                  className="rounded-lg border border-ink-muted/20 bg-surface px-3 py-1.5 text-xs font-medium text-ink outline-none transition-colors focus:border-amber dark:border-ink-muted-dark/20 dark:bg-surface-dark dark:text-ink-dark dark:focus:border-amber-dark"
                >
                  <option value={0}>{t.imgToPdfNoMargin}</option>
                  <option value={20}>{t.imgToPdfSmallMargin}</option>
                  <option value={40}>{t.imgToPdfLargeMargin}</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="add-more-input"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink-muted/20 bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-sm transition-all hover:border-amber/50 dark:border-ink-muted-dark/20 dark:bg-surface-dark dark:text-ink-dark dark:hover:border-amber-dark/50"
              >
                <Plus className="h-4 w-4 text-amber dark:text-amber-dark" />
                {t.imgToPdfAdd}
                <input
                  id="add-more-input"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleFiles(e.target.files ? [...e.target.files] : [])}
                  className="sr-only"
                />
              </label>

              <Button onClick={handleConvert} disabled={items.length === 0}>
                {t.imgToPdfExport}
              </Button>
            </div>
          </div>

          {/* Grid (4 columns on desktop, anti-slop) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item, idx) => (
                  <SortableImgItem
                    key={item.id}
                    item={item}
                    index={idx}
                    total={items.length}
                    frozen={frozen}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                    onRemove={() => handleRemove(item.id)}
                    t={t}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-2 text-center">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          progress={75}
          statusText="Building PDF document from images..."
        />
      )}

      {phase === 'done' && (
        <div className="phase-enter flex flex-col gap-5 rounded-2xl border border-amber/30 bg-surface p-6 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
          <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-ink dark:text-ink-dark">
                {t.lang === 'tr' ? 'PDF Başarıyla Oluşturuldu!' : 'PDF Document Created Successfully!'}
              </h3>
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr'
                  ? `${items.length} görsel birleştirilerek ${resultName} oluşturuldu (${durationMs} ms).`
                  : `Combined ${items.length} images into ${resultName} (${durationMs} ms).`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="ghost" onClick={handleReset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t.lang === 'tr' ? 'Yeni Görsel Seç' : 'Convert More Images'}
              </Button>
              <Button variant="primary" onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t.lang === 'tr' ? 'PDF İndir' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
