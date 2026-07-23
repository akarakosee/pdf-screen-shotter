// Mirrors the FakeWorker pattern from jobControllerRespawn.test.ts: verifies
// mergeFiles() posts the right message shape and that merge-progress/
// merge-done responses reach the right JobEvents callbacks.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobController } from '../src/app/JobController';
import type { MergeResult } from '../src/core/types';

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

describe('JobController.mergeFiles', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
  });

  it('posts a merge-start message with files and meta aligned by index', async () => {
    const controller = new JobController({});
    const fileA = new File(['a'], 'a.pdf');
    const fileB = new File(['b'], 'b.pdf');

    await controller.mergeFiles([
      { fileId: 'id-a', file: fileA },
      { fileId: 'id-b', file: fileB },
    ]);

    const posted = latestWorker().lastPosted as {
      type: string;
      files: ArrayBuffer[];
      meta: { fileId: string; name: string }[];
    };
    expect(posted.type).toBe('merge-start');
    expect(posted.meta).toEqual([
      { fileId: 'id-a', name: 'a.pdf' },
      { fileId: 'id-b', name: 'b.pdf' },
    ]);
    expect(posted.files).toHaveLength(2);
  });

  it('forwards merge-progress and merge-done to the matching events', async () => {
    const onMergeProgress = vi.fn();
    const onMergeDone = vi.fn();
    const controller = new JobController({ onMergeProgress, onMergeDone });

    await controller.mergeFiles([{ fileId: 'id-a', file: new File(['a'], 'a.pdf') }]);

    latestWorker().fire({ type: 'merge-progress', fileIndex: 1, totalFiles: 1 });
    expect(onMergeProgress).toHaveBeenCalledWith(1, 1);

    const result: MergeResult = {
      totalPages: 5,
      mergedFiles: 1,
      durationMs: 10,
      cancelled: false,
      output: new Blob(['x']),
      outputName: 'merged.pdf',
    };
    latestWorker().fire({ type: 'merge-done', result });
    expect(onMergeDone).toHaveBeenCalledWith(result);
  });
});
