// Unit tests for JobController's demo-render wiring (ADR-006). Mirrors the
// FakeWorker pattern from jobControllerRespawn.test.ts — no real Worker/WASM.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JobController } from '../src/app/JobController';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  posted: unknown[] = [];

  constructor(
    public url: URL,
    public opts: unknown,
  ) {
    FakeWorker.instances.push(this);
  }

  postMessage(msg: unknown): void {
    this.posted.push(msg);
  }

  terminate(): void {
    /* no-op */
  }

  emit(data: unknown): void {
    this.onmessage?.({ data });
  }
}

function latestWorker(): FakeWorker {
  return FakeWorker.instances[FakeWorker.instances.length - 1]!;
}

describe('JobController demo-render', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts a demo-render message with dpi and maxPages', async () => {
    const controller = new JobController({});
    const file = new File(['%PDF-'], 'demo-sample.pdf', { type: 'application/pdf' });

    await controller.demoRender(file, 100, 6);

    const posted = latestWorker().posted[0] as { type: string; dpi: number; maxPages: number };
    expect(posted.type).toBe('demo-render');
    expect(posted.dpi).toBe(100);
    expect(posted.maxPages).toBe(6);
  });

  it('dispatches demo-page, demo-done, and demo-error to their handlers', async () => {
    const onDemoPage = vi.fn();
    const onDemoDone = vi.fn();
    const onDemoError = vi.fn();
    const controller = new JobController({ onDemoPage, onDemoDone, onDemoError });
    const file = new File(['%PDF-'], 'demo-sample.pdf', { type: 'application/pdf' });
    await controller.demoRender(file, 100, 6);

    const blob = new Blob(['x'], { type: 'image/png' });
    latestWorker().emit({ type: 'demo-page', page: 1, blob });
    latestWorker().emit({ type: 'demo-done' });
    latestWorker().emit({ type: 'demo-error', message: 'boom' });

    expect(onDemoPage).toHaveBeenCalledWith(1, blob);
    expect(onDemoDone).toHaveBeenCalledTimes(1);
    expect(onDemoError).toHaveBeenCalledWith('boom');
  });
});
