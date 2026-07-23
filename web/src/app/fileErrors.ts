// Maps a worker file-error message code to the matching user-facing string.
// Shared by ToolShell and MergeShell — both surface the same file-level
// error taxonomy (encrypted | zero-pages | corrupt) on their FileChips.

import type { Strings } from '../i18n/en';

export function reasonText(code: string, t: Strings): string {
  switch (code) {
    case 'encrypted':
      return t.encryptedFile;
    case 'zero-pages':
      return t.zeroPages;
    default:
      return t.corruptFile;
  }
}
