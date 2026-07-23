// Regression test for the respawn cap: a worker that keeps failing to even
// initialize (e.g. a broken module in its dependency graph) must not be
// respawned forever. Reproduced live via an unbundled worker dependency that
// 504'd on every request — every respawn re-fetched the identical broken
// graph and failed identically, producing an unbounded loop. JobController
// now stops after MAX_FATALS_PER_WINDOW and surfaces onUnavailable once.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JobController } from '../src/app/JobController';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  terminated = false;

  constructor(
    public url: URL,
    public opts: unknown,
  ) {
    FakeWorker.instances.push(this);
  }

  postMessage(): void {
    /* no-op — tests drive behavior via fireFatal */
  }

  terminate(): void {
    this.terminated = true;
  }

  fireFatal(message: string): void {
    this.onmessage?.({ data: { type: 'fatal', message } });
  }
}

function latestWorker(): FakeWorker {
  return FakeWorker.instances[FakeWorker.instances.length - 1]!;
}

describe('JobController respawn cap', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stops respawning after repeated fatals and surfaces onUnavailable once', () => {
    const onFatal = vi.fn();
    const onUnavailable = vi.fn();
    const controller = new JobController({ onFatal, onUnavailable });

    controller.preload();
    expect(FakeWorker.instances).toHaveLength(1);

    // Fatal #1, #2, #3: each is within the "one-off" budget — respawn happens.
    latestWorker().fireFatal('boom 1');
    latestWorker().fireFatal('boom 2');
    latestWorker().fireFatal('boom 3');
    expect(onFatal).toHaveBeenCalledTimes(3);
    expect(onUnavailable).not.toHaveBeenCalled();
    expect(FakeWorker.instances).toHaveLength(4); // original + 3 respawns

    // Fatal #4: this is the one that would have looped forever — instead
    // JobController gives up and does NOT spawn a 5th worker.
    latestWorker().fireFatal('boom 4');
    expect(onFatal).toHaveBeenCalledTimes(3); // not called again
    expect(onUnavailable).toHaveBeenCalledTimes(1);
    expect(FakeWorker.instances).toHaveLength(4); // no new worker created

    // Every public method becomes a no-op afterward — no further respawn
    // attempts, no matter what the UI tries next.
    controller.preload();
    void controller.previewPage(new File(['x'], 'a.pdf'), 1).catch(() => {});
    void controller.inspect('id', new File(['x'], 'a.pdf'));
    expect(FakeWorker.instances).toHaveLength(4);
  });

  it('does not disable the controller for isolated fatals spaced apart in time', () => {
    const onFatal = vi.fn();
    const onUnavailable = vi.fn();
    const controller = new JobController({ onFatal, onUnavailable });

    vi.useFakeTimers();
    try {
      controller.preload();
      latestWorker().fireFatal('boom 1');
      vi.advanceTimersByTime(20_000); // outside the fatal-counting window
      latestWorker().fireFatal('boom 2');
      vi.advanceTimersByTime(20_000);
      latestWorker().fireFatal('boom 3');
      vi.advanceTimersByTime(20_000);
      latestWorker().fireFatal('boom 4');

      expect(onUnavailable).not.toHaveBeenCalled();
      expect(onFatal).toHaveBeenCalledTimes(4);
    } finally {
      vi.useRealTimers();
    }
  });
});
