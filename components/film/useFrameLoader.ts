'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type TierSpec = {
  frameCount: number;
  width: number;
  height: number;
  aspect?: number;
  pattern: string;
  patternFallback: string;
  pad: number;
};

export type FilmManifest = {
  version: number;
  tiers: Record<string, TierSpec>;
  source?: { duration: number; fps: number; width: number; height: number };
};

/** How many frames must decode before we reveal the canvas. */
const PRIME_COUNT = 24;
/** Parallel requests. Too many and the browser queues them anyway; too few and
 *  scrolling outruns the loader. Six matches typical HTTP/2 scheduling. */
const CONCURRENCY = 6;

function frameUrl(spec: TierSpec, index: number, ext: 'primary' | 'fallback') {
  const pattern = ext === 'primary' ? spec.pattern : spec.patternFallback;
  return pattern.replace('{n}', String(index + 1).padStart(spec.pad, '0'));
}

/** Feature-detect AVIF once. Safari < 16.4 and older Android need the WebP set. */
let avifSupport: Promise<boolean> | null = null;
function supportsAvif() {
  avifSupport ??= new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
  return avifSupport;
}

export type LoaderState = {
  /** 0-1 across all frames. */
  progress: number;
  /** True once PRIME_COUNT frames are decoded — safe to reveal the canvas. */
  primed: boolean;
  /** True once every frame is decoded. */
  complete: boolean;
  failed: boolean;
};

/**
 * Loads a frame sequence into memory, priming the opening frames first so the
 * canvas can reveal early, then streaming the remainder through a bounded
 * queue.
 *
 * Returns a `getFrame` that hands back the nearest *already-decoded* frame at
 * or before the requested index. That fallback is what keeps scrubbing smooth
 * while the tail of the sequence is still downloading — the film holds on the
 * last good frame instead of flashing blank.
 */
export function useFrameLoader(spec: TierSpec | null) {
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const [state, setState] = useState<LoaderState>({
    progress: 0,
    primed: false,
    complete: false,
    failed: false,
  });

  useEffect(() => {
    if (!spec) return;

    let cancelled = false;
    const { frameCount } = spec;
    framesRef.current = new Array(frameCount);
    loadedRef.current = new Array(frameCount).fill(false);

    let decoded = 0;
    let errors = 0;

    const load = (index: number, ext: 'primary' | 'fallback') =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (cancelled) return resolve();
          framesRef.current[index] = img;
          loadedRef.current[index] = true;
          decoded += 1;
          setState((s) => ({
            ...s,
            progress: decoded / frameCount,
            primed: s.primed || decoded >= Math.min(PRIME_COUNT, frameCount),
            complete: decoded >= frameCount,
          }));
          resolve();
        };
        img.onerror = () => {
          if (cancelled) return resolve();
          errors += 1;
          // A missing frame is survivable — getFrame falls back to the previous
          // decoded one. Only a wholesale failure is worth surfacing.
          if (errors > frameCount * 0.25) setState((s) => ({ ...s, failed: true }));
          resolve();
        };
        img.src = frameUrl(spec, index, ext);
      });

    (async () => {
      const ext: 'primary' | 'fallback' = (await supportsAvif()) ? 'primary' : 'fallback';
      if (cancelled) return;

      // Reset here rather than in the effect body: a synchronous setState there
      // costs an extra render on every mount. Nothing has loaded yet at this
      // point, so this is still before the first frame of a new sequence.
      setState({ progress: 0, primed: false, complete: false, failed: false });

      // Prime the opening frames so the reveal is not gated on the whole film.
      const primeEnd = Math.min(PRIME_COUNT, frameCount);
      for (let i = 0; i < primeEnd; i += CONCURRENCY) {
        if (cancelled) return;
        await Promise.all(
          Array.from({ length: Math.min(CONCURRENCY, primeEnd - i) }, (_, k) => load(i + k, ext)),
        );
      }

      // Stream the remainder through a bounded queue.
      let cursor = primeEnd;
      const worker = async () => {
        while (!cancelled && cursor < frameCount) {
          const index = cursor;
          cursor += 1;
          await load(index, ext);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    })();

    return () => {
      cancelled = true;
      framesRef.current = [];
      loadedRef.current = [];
    };
  }, [spec]);

  /**
   * Nearest decoded frame at or before `index`. Scanning backwards means a fast
   * scroll into not-yet-loaded territory holds the last real frame rather than
   * clearing the canvas.
   */
  const getFrame = useCallback((index: number): HTMLImageElement | undefined => {
    const frames = framesRef.current;
    const loaded = loadedRef.current;
    if (!frames.length) return undefined;

    const clamped = Math.max(0, Math.min(frames.length - 1, index));
    if (loaded[clamped]) return frames[clamped];

    for (let i = clamped - 1; i >= 0; i -= 1) if (loaded[i]) return frames[i];
    for (let i = clamped + 1; i < frames.length; i += 1) if (loaded[i]) return frames[i];
    return undefined;
  }, []);

  return { ...state, getFrame };
}
