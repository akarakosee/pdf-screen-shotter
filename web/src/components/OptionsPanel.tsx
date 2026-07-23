// OptionsPanel: DPI as a 4-way segmented control ("150 · Recommended"),
// mono-font page-range input with inline validation, background-color and
// delivery-method selectors, a compact file-info card, and an animated
// estimated-size bar. Format is NOT a tab — each format is its own page/URL
// (SEO decision).

import { useId } from 'react';
import { DPI_PRESETS } from '../core/config';
import type { ExportOptions } from '../core/types';
import type { Strings } from '../i18n/en';
import { formatSize } from './FileChip';
import { PrivacyLine } from './PrivacyLine';

// A soft reference ceiling for the capacity bar — not a real limit (the tool
// has none), just the visual scale the fill percentage is drawn against.
const ESTIMATE_BAR_REFERENCE_BYTES = 100 * 1024 * 1024;

interface FileInfo {
  name: string;
  pageCount: number | null;
  size: number;
}

interface Props {
  t: Strings;
  dpi: ExportOptions['dpi'];
  onDpi: (dpi: ExportOptions['dpi']) => void;
  pageRange: string;
  onPageRange: (value: string) => void;
  rangeError: string | null;
  rangeNotice?: string | null; // non-blocking, e.g. clamp warning (R2)
  estimatedSize?: { bytes: number; text: string } | null;
  format: 'png' | 'jpg';
  backgroundColor: NonNullable<ExportOptions['backgroundColor']>;
  onBackgroundColor: (v: NonNullable<ExportOptions['backgroundColor']>) => void;
  fileInfo?: FileInfo | null;
}

export function OptionsPanel({
  t,
  dpi,
  onDpi,
  pageRange,
  onPageRange,
  rangeError,
  rangeNotice = null,
  estimatedSize = null,
  format,
  backgroundColor,
  onBackgroundColor,
  fileInfo = null,
}: Props) {
  const rangeId = useId();
  const errorId = useId();
  // JPEG has no alpha channel — "transparent" would silently fall back to
  // white on export, which is confusing to offer as a distinct choice.
  const bgOptions: NonNullable<ExportOptions['backgroundColor']>[] =
    format === 'png' ? ['white', 'black', 'transparent'] : ['white', 'black'];
  const bgLabel = { white: t.bgWhite, black: t.bgBlack, transparent: t.bgTransparent };
  const barPct = estimatedSize
    ? Math.min(100, (estimatedSize.bytes / ESTIMATE_BAR_REFERENCE_BYTES) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
          {t.dpiLabel}
        </legend>
        {/* Flexible-width segments: the "Recommended" label (and its longer TR
            translation) must never clip — widths follow content. */}
        <div role="radiogroup" className="flex overflow-hidden rounded-s border">
          {DPI_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={dpi === preset}
              onClick={() => onDpi(preset)}
              className={`min-h-11 flex-auto whitespace-nowrap border-r px-3 text-xs last:border-r-0 transition-colors duration-[120ms] ${
                dpi === preset
                  ? 'bg-amber font-medium text-[#1D1108] dark:bg-amber-dark'
                  : 'bg-surface text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark'
              }`}
            >
              {preset === 150 ? `150 · ${t.dpiRecommended}` : preset}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor={rangeId}
          className="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-muted-dark"
        >
          {t.pageRangeLabel}
        </label>
        <input
          id={rangeId}
          type="text"
          inputMode="numeric"
          value={pageRange}
          onChange={(e) => onPageRange(e.currentTarget.value)}
          placeholder={t.pageRangePlaceholder}
          aria-invalid={rangeError != null}
          aria-describedby={rangeError ? errorId : undefined}
          className={`w-full min-h-11 rounded-s border bg-surface px-3 font-mono text-xs text-ink dark:bg-surface-dark dark:text-ink-dark ${
            rangeError ? 'border-danger' : ''
          }`}
        />
        {/* CLS fix: this space is reserved whether or not there's a message,
            so typing an invalid range never pushes the rest of the panel
            (and the Convert button below it) down. */}
        <div className="mt-1 min-h-[20px]">
          {rangeError && (
            <p id={errorId} className="text-xs text-danger">
              {rangeError}
            </p>
          )}
          {!rangeError && rangeNotice && (
            <p className="text-xs text-warning" role="status">
              {rangeNotice}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
          {t.backgroundColorLabel}
        </legend>
        <div role="radiogroup" className="flex gap-2">
          {bgOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={backgroundColor === opt}
              onClick={() => onBackgroundColor(opt)}
              className={`btn-motion flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-s border px-2 text-xs transition-colors duration-[120ms] ${
                backgroundColor === opt
                  ? 'border-accent bg-accent/10 font-medium text-accent dark:text-accent'
                  : 'bg-surface text-ink-muted hover:bg-bg dark:bg-surface-dark dark:text-ink-muted-dark dark:hover:bg-bg-dark'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-3.5 w-3.5 shrink-0 rounded-full border ${
                  opt === 'white' ? 'bg-white' : opt === 'black' ? 'bg-black' : ''
                }`}
                style={
                  opt === 'transparent'
                    ? {
                        backgroundImage:
                          'conic-gradient(#ccc 90deg, transparent 90deg 180deg, #ccc 180deg 270deg, transparent 270deg)',
                        backgroundSize: '6px 6px',
                      }
                    : undefined
                }
              />
              {bgLabel[opt]}
            </button>
          ))}
        </div>
      </fieldset>



      {fileInfo && (
        <div className="rounded-s border bg-surface/60 p-3 backdrop-blur-sm dark:bg-surface-dark/60">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
            {t.fileInfoTitle}
          </p>
          <dl className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-muted dark:text-ink-muted-dark">{t.fileInfoName}</dt>
              <dd className="truncate font-mono text-ink dark:text-ink-dark">{fileInfo.name}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-muted dark:text-ink-muted-dark">{t.pageRangeLabel}</dt>
              <dd className="font-mono text-ink dark:text-ink-dark">
                {fileInfo.pageCount ?? '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-muted dark:text-ink-muted-dark">{t.fileInfoSize}</dt>
              <dd className="font-mono text-ink dark:text-ink-dark">{formatSize(fileInfo.size)}</dd>
            </div>
          </dl>
        </div>
      )}

      {estimatedSize && (
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.estimatedSizeLabel}</span>
            <span className="font-mono">{estimatedSize.text}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface dark:bg-surface-dark border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-amber transition-[width] duration-500 ease-out"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="mt-[5px] flex justify-center">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}
    </div>
  );
}
