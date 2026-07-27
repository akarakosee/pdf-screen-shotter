// PagePreview: single large page image with prev/next navigation. Replaces
// the filmstrip — a dense strip of tiny thumbnails read as empty/low-effort
// at this box's size; one big page plus a real paginator reads as premium
// and matches how people actually skim a document one page at a time.
// Pages are fetched on demand (ADR-007's previewPage), with the current
// neighbour prefetched in the background so Next/Previous feels instant.

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Strings } from '../i18n/en';
import { fmt } from '../i18n/en';

interface Props {
  t: Strings;
  file: File;
  pageCount: number;
  getPage: (page: number) => Promise<Blob>;
}

type LoadState = 'loading' | 'error' | 'ready';

export function PagePreview({ t, file, pageCount, getPage }: Props) {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<LoadState>('loading');
  const [url, setUrl] = useState<string | null>(null);
  const cacheRef = useRef(new Map<number, string>());
  const getPageRef = useRef(getPage);
  getPageRef.current = getPage;

  // New file → drop the whole cache (URLs belong to the previous file).
  useEffect(() => {
    cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setPage(1);
  }, [file]);

  useEffect(() => {
    return () => {
      cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // Fetch (or serve from cache) the current page; quietly prefetch its
  // neighbours so Previous/Next after the first view is instant.
  useEffect(() => {
    let cancelled = false;
    const cached = cacheRef.current.get(page);
    if (cached) {
      setUrl(cached);
      setState('ready');
    } else {
      setState('loading');
      setUrl(null);
      getPageRef
        .current(page)
        .then((blob) => {
          if (cancelled) return;
          const u = URL.createObjectURL(blob);
          cacheRef.current.set(page, u);
          setUrl(u);
          setState('ready');
        })
        .catch(() => {
          if (!cancelled) setState('error');
        });
    }

    for (const neighbour of [page - 1, page + 1]) {
      if (neighbour < 1 || neighbour > pageCount || cacheRef.current.has(neighbour)) continue;
      getPageRef
        .current(neighbour)
        .then((blob) => {
          if (!cacheRef.current.has(neighbour)) {
            cacheRef.current.set(neighbour, URL.createObjectURL(blob));
          }
        })
        .catch(() => {
          // Prefetch is best-effort — Next/Previous will just refetch and
          // show the loading state if this neighbour turns out to fail.
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageCount]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(pageCount, p + 1));

  return (
    <div
      className="flex flex-1 flex-col items-center gap-3 outline-none"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goPrev();
        else if (e.key === 'ArrowRight') goNext();
      }}
    >
      <div className="flex flex-1 min-h-0 w-full items-center justify-center p-[5px]">
        {state === 'ready' && url ? (
          <img
            key={page}
            src={url}
            alt={fmt(t.pageThumbnailAlt, { n: page })}
            className="paper-page pop-in h-full w-auto max-w-full border object-contain"
          />
        ) : state === 'error' ? (
          <p
            className="text-xs text-ink-muted dark:text-ink-muted-dark"
            aria-label={fmt(t.pageThumbnailUnavailable, { n: page })}
          >
            {fmt(t.pageThumbnailUnavailable, { n: page })}
          </p>
        ) : (
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark" aria-live="polite">
            {t.pageLoading}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={page <= 1}
          aria-label={t.pageNavPrevious}
          className="btn-motion flex h-9 w-9 items-center justify-center rounded-full border bg-surface text-ink-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none dark:bg-surface-dark dark:text-ink-muted-dark dark:hover:text-ink-dark"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="min-w-[5.5rem] text-center font-mono text-xs text-ink-muted dark:text-ink-muted-dark">
          {fmt(t.progressPage, { i: page, n: pageCount })}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={page >= pageCount}
          aria-label={t.pageNavNext}
          className="btn-motion flex h-9 w-9 items-center justify-center rounded-full border bg-surface text-ink-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none dark:bg-surface-dark dark:text-ink-muted-dark dark:hover:text-ink-dark"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
