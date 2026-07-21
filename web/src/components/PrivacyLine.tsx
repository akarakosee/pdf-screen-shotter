import { Lock } from 'lucide-react';
import type { Strings } from '../i18n/en';

const REPO_URL = 'https://github.com/ayberkkarakose/PDF_Screen_Shotter';

export function PrivacyLine({ t }: { t: Strings }) {
  return (
    <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted dark:text-ink-muted-dark">
      <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      <span>
        {t.privacyLine}{' '}
        <a
          href={REPO_URL}
          rel="noopener"
          className="underline underline-offset-2 hover:text-ink dark:hover:text-ink-dark"
        >
          {t.privacyVerify}
        </a>
      </span>
    </p>
  );
}
