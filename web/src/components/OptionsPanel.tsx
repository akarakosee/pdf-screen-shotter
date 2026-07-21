// OptionsPanel: DPI as a 4-way segmented control ("150 · Recommended"),
// mono-font page-range input with inline validation. Format is NOT a tab —
// each format is its own page/URL (SEO decision).

import { useId } from 'react';
import { DPI_PRESETS } from '../core/config';
import type { ExportOptions } from '../core/types';
import type { Strings } from '../i18n/en';

interface Props {
  t: Strings;
  dpi: ExportOptions['dpi'];
  onDpi: (dpi: ExportOptions['dpi']) => void;
  pageRange: string;
  onPageRange: (value: string) => void;
  rangeError: string | null;
  rangeNotice?: string | null; // non-blocking, e.g. clamp warning (R2)
}

export function OptionsPanel({
  t,
  dpi,
  onDpi,
  pageRange,
  onPageRange,
  rangeError,
  rangeNotice = null,
}: Props) {
  const rangeId = useId();
  const errorId = useId();
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
                  ? 'bg-accent font-medium text-white'
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
        {rangeError && (
          <p id={errorId} className="mt-1 text-xs text-danger">
            {rangeError}
          </p>
        )}
        {!rangeError && rangeNotice && (
          <p className="mt-1 text-xs text-warning" role="status">
            {rangeNotice}
          </p>
        )}
      </div>
    </div>
  );
}
