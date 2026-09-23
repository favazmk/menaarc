'use client';

import { Wordmark } from '@/components/brand/Wordmark';

/**
 * The wait is unavoidable — a frame sequence has to arrive before it can be
 * scrubbed — so it is treated as the first brand impression rather than a
 * spinner. The wordmark holds, a hairline fills, the film takes over.
 */
export function FilmLoader({ progress, failed }: { progress: number; failed: boolean }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="flex flex-col items-center">
        <Wordmark size="lg" withArabic className="opacity-90" />
        <p className="u-label mt-6 text-[var(--color-paper)]/70">
          Design and Project Management
        </p>
      </div>
      <div className="mt-12 w-[min(22rem,60vw)]">
        <div className="h-px w-full bg-[var(--color-paper)]/20">
          <div
            className="h-full origin-left bg-[var(--color-paper)] transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
          />
        </div>
        <div className="mt-4 flex justify-between">
          <span className="u-label text-[var(--color-paper)]/50">
            {failed ? 'Reduced quality' : 'Loading film'}
          </span>
          <span className="u-label tabular-nums text-[var(--color-paper)]/50">
            {String(Math.round(progress * 100)).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
