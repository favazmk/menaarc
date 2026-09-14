'use client';

import { useMemo } from 'react';

export type Chapter = {
  id: string;
  index: string;
  label: string;
  headline: string;
  body: string;
  from: number;
  to: number;
};

/** Fraction of each chapter's span spent fading in and out. */
const EDGE = 0.22;

/**
 * Opacity for a chapter at the current scroll progress: ramps in at the start
 * of its range, holds, ramps out at the end. Chapters whose ranges don't
 * overlap therefore cross-fade through the film rather than cutting.
 */
function chapterOpacity(progress: number, from: number, to: number) {
  if (progress < from || progress > to) return 0;
  const span = to - from;
  if (span <= 0) return 0;
  const local = (progress - from) / span;
  // A chapter anchored at either end of the film has no room to ramp there, so
  // it starts (or stays) fully visible instead of fading in from nothing.
  // Without this the opening chapter is invisible until the user scrolls.
  const fadeIn = from <= 0 ? 1 : Math.min(1, local / EDGE);
  const fadeOut = to >= 1 ? 1 : Math.min(1, (1 - local) / EDGE);
  return Math.min(fadeIn, fadeOut);
}

/**
 * `overlay` sets the type on top of a full-bleed frame — the desktop case.
 * `stacked` puts it beneath a letterboxed strip, which is what a landscape
 * master needs on a portrait phone: overlaying there buries the copy in the
 * picture and strands dead space above and below it.
 */
export type ChapterLayout = 'overlay' | 'stacked';

export function FilmChapters({
  chapters,
  progress,
  layout = 'overlay',
  bandBottom = '0px',
}: {
  chapters: Chapter[];
  progress: number;
  layout?: ChapterLayout;
  /** Where the film strip ends, so stacked type can start beneath it. */
  bandBottom?: string;
}) {
  const active = useMemo(
    () => chapters.map((c) => ({ c, o: chapterOpacity(progress, c.from, c.to) })),
    [chapters, progress],
  );

  const stacked = layout === 'stacked';

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="u-shell absolute inset-x-0 bottom-0"
        style={{ top: stacked ? bandBottom : '0px' }}
      >
        <div
          className={`relative flex h-full w-full ${stacked ? 'items-start pt-9' : 'items-center'}`}
        >
          <div className="relative w-full max-w-[40rem]">
            {active.map(({ c, o }) => (
              <article
                key={c.id}
                // Chapters occupy one position, not a sequence, so a cross-fade
                // never reflows the layout mid-scroll.
                className={`absolute inset-x-0 text-[var(--color-paper)] ${
                  stacked ? 'top-0' : 'top-1/2'
                }`}
                style={{
                  opacity: o,
                  // A small rise on entry, settling as the chapter holds.
                  transform: stacked
                    ? `translateY(${(1 - o) * 14}px)`
                    : `translateY(calc(-50% + ${(1 - o) * 14}px))`,
                  visibility: o <= 0.01 ? 'hidden' : 'visible',
                  willChange: 'opacity, transform',
                }}
              >
                <p className="u-label text-[var(--color-paper)]/60">
                  <span className="text-[var(--color-accent)]">{c.index}</span>
                  <span className="mx-3 opacity-40">/</span>
                  {c.label}
                </p>
                <h2
                  className="mt-4 whitespace-pre-line font-[family-name:var(--font-display)] leading-[0.98] tracking-[-0.025em]"
                  style={{
                    fontSize: stacked ? 'clamp(1.6rem, 7.4vw, 2.4rem)' : 'var(--text-headline)',
                  }}
                >
                  {c.headline}
                </h2>
                <p
                  className="u-lede mt-5 max-w-[38ch] text-[var(--color-paper)]/70"
                  style={stacked ? { fontSize: '0.9375rem', lineHeight: 1.5 } : undefined}
                >
                  {c.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Progress rule — a single hairline that fills across the film. */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-[var(--color-paper)]/15">
        <div
          className="h-full origin-left bg-[var(--color-accent)]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}
