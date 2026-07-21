// Streaming ZIP writer (SISTEM_TASARIMI §3.4): each rendered page is written to
// the ZIP stream immediately and its buffer released, so at most ~1 rendered
// page lives in memory. PNG/JPEG are already compressed → entries are STORED.

import { Zip, ZipPassThrough } from 'fflate';

export class ZipStream {
  private chunks: Uint8Array[] = [];
  private zip: Zip;
  private error: Error | null = null;
  private finished: Promise<void>;
  private resolveFinished!: () => void;

  constructor() {
    this.finished = new Promise((res) => (this.resolveFinished = res));
    this.zip = new Zip((err, chunk, final) => {
      if (err) {
        this.error = err;
        this.resolveFinished();
        return;
      }
      if (chunk) this.chunks.push(chunk);
      if (final) this.resolveFinished();
    });
  }

  add(name: string, data: Uint8Array): void {
    if (this.error) throw this.error;
    const entry = new ZipPassThrough(name);
    this.zip.add(entry);
    entry.push(data, true);
  }

  /** Number of entries' bytes accumulated so far (compressed stream size). */
  get byteLength(): number {
    return this.chunks.reduce((n, c) => n + c.length, 0);
  }

  get entryError(): Error | null {
    return this.error;
  }

  /** Finalize and return the ZIP as a single Blob. Usable after cancel too —
   * pages written so far are preserved (partial ZIP download). */
  async toBlob(): Promise<Blob> {
    this.zip.end();
    await this.finished;
    if (this.error) throw this.error;
    return new Blob(this.chunks as BlobPart[], { type: 'application/zip' });
  }
}
