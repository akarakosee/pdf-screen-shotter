import { useState } from 'react';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ToolShell } from './ToolShell';

interface Props {
  t?: Strings;
}

export function MixPdfShell({ t = en }: Props) {
  return (
    <div className="w-full">
      <ToolShell t={t} format="mix-pdf" />
    </div>
  );
}
