# Broken fixtures (error-path tests, PRD R1/R5)

Generated 2026-07-21 for the web build (increment 4). Each exercises one row of
the error taxonomy (SISTEM_TASARIMI §3.6):

- `encrypted.pdf` — sample-20p.pdf saved with AES-256 user password ("secret").
  → `engine.open` throws EncryptedError → file-error "encrypted".
- `corrupt-garbage.pdf` — `%PDF-` header followed by random bytes; unrepairable.
  → `engine.open` throws → file-error "corrupt".
- `corrupt-truncated.pdf` — first 40 000 bytes of sample-20p.pdf. Measured:
  MuPDF repairs the xref, reports 20 pages, and renders missing pages as blanks
  (no throw). → exercises the repair/degraded path; per-page render errors are
  rare with MuPDF, so the worker's page-error branch is covered by its try/catch
  rather than a reproducible fixture.
- `zero-pages.pdf` — valid minimal PDF with an empty /Pages tree.
  → pageCount 0 → file-error "zero-pages".
- `fake-extension.pdf` — PNG bytes renamed to .pdf.
  → rejected client-side by the magic-bytes validator (never reaches the engine).
