// Homepage hero — live "Developing Tray" demo (ADR-006). Loaded with
// client:idle so it never blocks the hero's first paint. A real bundled PDF
// is rendered by the same MuPDF WASM engine and worker protocol the tool
// pages use, one page at a time, straight into real thumbnails — not
// symbolic placeholder blocks.

import { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';

const DEMO_URL = '/demo-sample.pdf';
const FALLBACK_URL = '/demo-fallback.png';
const DEMO_PAGES = 6;
const DEMO_DPI = 100;

interface Props {
  trayLabel: string;
  processingLabel: string;
  sampleLabel: string;
}

type Mode = 'loading' | 'live' | 'fallback';

export function DevelopingTray({ trayLabel, processingLabel, sampleLabel }: Props) {
  const [urls, setUrls] = useState<(string | null)[]>(Array(DEMO_PAGES).fill(null));
  const [mode, setMode] = useState<Mode>('loading');
  const controllerRef = useRef<JobController | null>(null);
  const playedRef = useRef(false);
  const isMountedRef = useRef(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const play = useCallback(async () => {
    if (playedRef.current) return;
    playedRef.current = true;

    const supported = typeof WebAssembly !== 'undefined' && typeof Worker !== 'undefined';
    if (!supported) {
      if (isMountedRef.current) setMode('fallback');
      return;
    }

    let buf: ArrayBuffer;
    try {
      const res = await fetch(DEMO_URL);
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      buf = await res.arrayBuffer();
    } catch {
      if (isMountedRef.current) setMode('fallback');
      return;
    }

    if (!isMountedRef.current) return;

    const file = new File([buf], 'demo-sample.pdf', { type: 'application/pdf' });
    const controller = new JobController({
      onDemoPage: (page, blob) => {
        if (!isMountedRef.current) return;
        setUrls((cur) => {
          const next = [...cur];
          next[page - 1] = URL.createObjectURL(blob);
          return next;
        });
      },
      onDemoDone: () => {
        if (isMountedRef.current) setMode('live');
      },
      onDemoError: () => {
        if (isMountedRef.current) setMode('fallback');
      },
      onFatal: () => {
        if (isMountedRef.current) setMode('fallback');
      },
    });

    // Dispose whatever controller (and its worker) is still around from a
    // previous replay cycle before this one takes over.
    controllerRef.current?.dispose();
    controllerRef.current = controller;
    setMode('live');
    await controller.demoRender(file, DEMO_DPI, DEMO_PAGES);
  }, []);

  // Idle-load: never compete with the hero's first paint.
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idle = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = w.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => void play());
    return () => {
      isMountedRef.current = false;
      cancelIdle(id as number);
      controllerRef.current?.dispose();
      setUrls((cur) => {
        for (const u of cur) if (u) URL.revokeObjectURL(u);
        return cur;
      });
    };
  }, [play]);

  // Replay once if the user scrolls away and back — never on a timer (no
  // perpetual loop, taste-skill §9.F), and never under reduced-motion.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !rootRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let wasVisible = false;
    let hasSeenFirstCallback = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry!.isIntersecting;
        if (!hasSeenFirstCallback) {
          // Establish the baseline visibility only — the very first callback
          // reflects the tray's state at observe() time, not a real
          // visible→invisible→visible transition, so it must never trigger
          // a replay.
          hasSeenFirstCallback = true;
          wasVisible = isIntersecting;
          return;
        }
        if (isIntersecting && !wasVisible && mode === 'live') {
          playedRef.current = false;
          setUrls((cur) => {
            for (const u of cur) if (u) URL.revokeObjectURL(u);
            return Array(DEMO_PAGES).fill(null);
          });
          void play();
        }
        wasVisible = isIntersecting;
      },
      { threshold: 0.4 },
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [mode, play]);

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-m border bg-surface dark:border-white/[0.14] dark:bg-gradient-to-br dark:from-surface-dark dark:to-bg-dark"
    >
      <div className="flex items-center justify-between border-b px-5 py-3 font-mono text-[11px] text-ink-muted dark:text-ink-faint-dark">
        <span>{trayLabel}</span>
        <span className="flex items-center gap-1.5 text-accent dark:text-teal-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-teal-dark" />
          {mode === 'fallback' ? sampleLabel : processingLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 p-6 sm:grid-cols-6">
        {urls.map((url, i) =>
          mode === 'fallback' ? (
            <img
              key={i}
              src={FALLBACK_URL}
              alt=""
              className="tray-cell aspect-[3/4] rounded-[3px] object-cover"
            />
          ) : url ? (
            <img
              key={i}
              src={url}
              alt=""
              className="tray-cell tray-cell--develop aspect-[3/4] rounded-[3px] object-cover"
            />
          ) : (
            <div key={i} className="tray-cell aspect-[3/4] rounded-[3px] bg-bg-2-dark" />
          ),
        )}
      </div>
    </div>
  );
}
