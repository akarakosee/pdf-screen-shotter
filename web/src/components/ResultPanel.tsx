// ResultPanel: success · partial · failed. Exactly ONE primary action (the
// download button). "Convert more" is ghost; cross-tool suggestion is a plain
// text link — never a button (hierarchy rule, design-critique).

import type { ExportResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { fmt } from '../i18n/en';
import { Button } from './ui/Button';
import { Check, Download, RefreshCw } from 'lucide-react';

interface SkippedRow {
  fileName: string;
  detail: string;
}

interface Props {
  t: Strings;
  result: ExportResult;
  skipped: SkippedRow[]; // file-level + page-level failures, resolved to names
  crossLink: { href: string; label: string } | null;
  onDownload: () => void;
  onConvertMore: () => void;
}

export function ResultPanel({ t, result, skipped, crossLink, onDownload, onConvertMore }: Props) {
  const failedPages = result.failed.length;
  let headline: string;
  if (result.cancelled) {
    headline = fmt(t.afterCancel, { n: result.succeeded });
  } else if (failedPages > 0 || skipped.length > 0) {
    headline = fmt(t.partialSuccess, {
      ok: result.succeeded,
      total: result.totalPages,
      failed: result.totalPages - result.succeeded,
    });
  } else {
    headline = fmt(t.allConverted, { n: result.succeeded });
  }

  const isZip = result.outputName?.endsWith('.zip') ?? false;
  const fileCount = result.pages?.length ?? 0;

  // ADR-005: the done state sits on a shadow-3 card (one of shadow-3's two
  // permitted homes); the download button springs in 0.97→1. No shimmer here —
  // the hero keeps the sole signature treatment (ADR-005 §Decision.2.7).
  return (
    <div
      role="status"
      className="phase-enter flex flex-col gap-5 rounded-2xl border border-amber/30 bg-surface p-6 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]"
    >
      <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-ink dark:text-ink-dark">
            {t.lang === 'tr' ? 'İşlem Başarıyla Tamamlandı!' : 'Process Completed Successfully!'}
          </h3>
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">{headline}</p>
        </div>

        {skipped.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-ink-muted/20 w-full text-left my-2 dark:border-ink-muted-dark/20">
            <table className="w-full text-xs">
              <caption className="sr-only">{t.skippedDetails}</caption>
              <tbody>
                {skipped.map((row, i) => (
                  <tr key={i} className="border-b border-ink-muted/20 last:border-b-0 dark:border-ink-muted-dark/20">
                    <td className="px-3 py-2 font-mono text-ink dark:text-ink-dark">{row.fileName}</td>
                    <td className="px-3 py-2 text-ink-muted dark:text-ink-muted-dark">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.succeeded > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="ghost" onClick={onConvertMore} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t.convertMore}
            </Button>
            <Button variant="primary" className="result-pop flex items-center gap-2" onClick={onDownload}>
              <Download className="h-4 w-4" />
              {fileCount > 0 ? fmt(t.downloadAllCount, { n: fileCount }) : isZip ? t.downloadZip : t.download}
            </Button>
          </div>
        )}
        {result.succeeded === 0 && (
          <div>
            <Button variant="secondary" onClick={onConvertMore} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t.convertMore}
            </Button>
          </div>
        )}

        {crossLink && (
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark pt-1">
            <a href={crossLink.href} className="underline underline-offset-2 hover:text-ink dark:hover:text-ink-dark">
              {crossLink.label}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
