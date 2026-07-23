import { describe, expect, it } from 'vitest';
import { reasonText } from '../src/app/fileErrors';
import { en } from '../src/i18n/en';

describe('reasonText', () => {
  it('maps encrypted to the encrypted-file string', () => {
    expect(reasonText('encrypted', en)).toBe(en.encryptedFile);
  });

  it('maps zero-pages to the zero-pages string', () => {
    expect(reasonText('zero-pages', en)).toBe(en.zeroPages);
  });

  it('falls back to the corrupt-file string for anything else', () => {
    expect(reasonText('corrupt', en)).toBe(en.corruptFile);
    expect(reasonText('anything-unrecognized', en)).toBe(en.corruptFile);
  });
});
