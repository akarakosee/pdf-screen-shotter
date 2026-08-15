import { Lock } from 'lucide-react';
import type { Strings } from '../i18n/en';



export function PrivacyLine({ t }: { t: Strings }) {
  return (
    <p className="flex items-center gap-2 text-xs text-ink-muted dark:text-ink-muted-dark whitespace-nowrap">
      <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      <span>
        {t.privacyLine}
      </span>
    </p>
  );
}
