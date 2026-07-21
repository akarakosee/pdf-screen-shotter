// Preview card: loading · ready · unavailable. True aspect ratio; 120ms
// cross-fade on DPI change (via key remount + opacity transition).

import type { Strings } from '../i18n/en';

interface Props {
  t: Strings;
  state: 'loading' | 'ready' | 'unavailable';
  url: string | null;
}

export function Preview({ t, state, url }: Props) {
  return (
    <figure className="flex min-h-40 flex-col rounded-s border bg-surface p-3 dark:bg-surface-dark">
      <figcaption className="mb-2 text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
        {t.previewTitle}
      </figcaption>
      <div className="flex flex-1 items-center justify-center">
        {state === 'ready' && url ? (
          <img
            key={url}
            src={url}
            alt=""
            className="max-h-72 w-auto max-w-full border transition-opacity duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]"
          />
        ) : (
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark" aria-live="polite">
            {state === 'loading' ? t.previewLoading : t.previewUnavailable}
          </p>
        )}
      </div>
    </figure>
  );
}
