// ResultPanel: success · partial · failed. Exactly ONE primary action (the
// download button). "Convert more" is ghost; cross-tool suggestion is a plain
// text link — never a button (hierarchy rule, design-critique).

import type { ExportResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { fmt } from '../i18n/en';
import { Button } from './ui/Button';

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
      className="phase-enter elev-3 flex flex-col gap-4 rounded-m border bg-surface p-5 dark:bg-surface-dark"
    >
      <p className="text-sm">{headline}</p>

      {skipped.length > 0 && (
        <div className="overflow-x-auto rounded-s border">
          <table className="w-full text-xs">
            <caption className="sr-only">{t.skippedDetails}</caption>
            <tbody>
              {skipped.map((row, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-mono">{row.fileName}</td>
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
        <div className="flex items-center gap-2">
          <Button className="result-pop" onClick={onDownload}>
            {fileCount > 0 ? fmt(t.downloadAllCount, { n: fileCount }) : isZip ? t.downloadZip : t.download}
          </Button>
          <Button variant="ghost" onClick={onConvertMore}>
            {t.convertMore}
          </Button>
        </div>
      )}
      {result.succeeded === 0 && (
        <div>
          <Button variant="secondary" onClick={onConvertMore}>
            {t.convertMore}
          </Button>
        </div>
      )}

      {crossLink && (
        <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
          <a href={crossLink.href} className="underline underline-offset-2 hover:text-ink dark:hover:text-ink-dark">
            {crossLink.label}
          </a>
        </p>
      )}
    </div>
  );
}
