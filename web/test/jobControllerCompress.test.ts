import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobController } from '../src/app/JobController';
import type { CompressResult } from '../src/core/types';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  lastPosted: unknown = null;

  constructor(
    public url: URL,
    public opts: unknown,
  ) {
    FakeWorker.instances.push(this);
  }

  postMessage(msg: unknown): void {
    this.lastPosted = msg;
  }

  terminate(): void {}

  fire(data: unknown): void {
    this.onmessage?.({ data });
  }
}

function latestWorker(): FakeWorker {
  return FakeWorker.instances[FakeWorker.instances.length - 1]!;
}

describe('JobController compress', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker as unknown as typeof Worker);
  });

  it('posts compress-start and dispatches compress-done event', async () => {
    const onCompressDone = vi.fn<[CompressResult], void>();
    const c = new JobController({ onCompressDone });

    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
    await c.compressStart(file, 'f-1', 'recommended');

    const w = latestWorker();
    expect(w.lastPosted).toMatchObject({
      type: 'compress-start',
      level: 'recommended',
      meta: { fileId: 'f-1', name: 'test.pdf' },
    });

    const result: CompressResult = {
      originalSize: 1000,
      compressedSize: 400,
      durationMs: 50,
      cancelled: false,
      outputName: 'test-compressed.pdf',
    };
    w.fire({ type: 'compress-done', result });

    expect(onCompressDone).toHaveBeenCalledWith(result);
  });
});
