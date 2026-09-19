'use client';

import { useImperativeHandle, useRef, type RefObject } from 'react';

export type Chapter = {
  id: string;
  index: string;
  label: string;
  /** Sheet reference, set in the top corner like a drawing's fin number. */
  marker: string;
  headline: string;
  sub: string;
  /** Annotation lines, hung off a rule like callouts on a drawing. */
  specs: string[];
  from: number;
  to: number;
};

/** Fraction of each chapter's span spent flying in and flying out. */
const EDGE = 0.26;
/** Where a chapter starts, in px behind the screen plane. */
const Z_IN = -460;
/** Where it ends up, in px in front of it — past the camera, not fading in place. */
const Z_OUT = 340;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const STATION_ON = 'var(--color-accent)';
const STATION_OFF = 'rgb(250 250 250 / 0.35)';

/**
 * Opacity and depth for a chapter at the current scroll progress.
 *
 * The chapter is a card in space, not a layer on glass: it arrives from behind
 * the screen plane, settles at z=0 while it holds, then travels forward past
 * the camera as the next one comes up. The perspective on the parent turns that
 * single Z value into the scale, so nothing has to animate size directly and
 * the growth stays geometrically correct rather than a guessed keyframe.
 *
 * Opacity on the way out is deliberately behind the movement (`** 0.55`), so
 * the type is still legible while it is enlarging and only dissolves once it is
 * genuinely too close to read. Fading in step with the travel reads as a
 * cross-fade with a scale bolted on, which is the thing this replaces.
 */
function chapterState(progress: number, from: number, to: number) {
  const span = to - from;
  if (span <= 0 || progress < from || progress > to) return { o: 0, z: Z_IN };

  const local = (progress - from) / span;

  // A chapter anchored at either end of the film has no room to ramp there, so
  // it starts (or stays) fully arrived instead of flying in from nothing.
  // Without this the opening chapter is invisible until the user scrolls.
  const inT = from <= 0 ? 1 : Math.min(1, local / EDGE);
  const outT = to >= 1 ? 1 : Math.min(1, (1 - local) / EDGE);

  if (inT < 1) return { o: inT, z: Z_IN * (1 - easeOut(inT)) };
  if (outT < 1) return { o: outT ** 0.55, z: Z_OUT * (1 - easeOut(outT)) };
  return { o: 1, z: 0 };
}

/**
 * How the chapter type sits against the frame:
 *
 * - `overlay`  — upper left of a full-bleed frame, where a drawing puts its
 *                title block. The desktop case.
 * - `bottom`   — anchored low over a full-bleed frame. A portrait master on a
 *                phone fills the screen edge to edge, so upper-left type lands
 *                on the subject; the lower third is where the eye expects copy
 *                and where a scrim reads as deliberate.
 * - `stacked`  — beneath a letterboxed strip. The fallback when the master is
 *                landscape and the viewport is portrait, where overlaying
 *                would bury the copy and strand dead space around it.
 */
export type ChapterLayout = 'overlay' | 'bottom' | 'stacked';

/** What the scroll driver is handed, so it never has to re-render this tree. */
export type FilmChaptersHandle = { update: (progress: number) => void };

export function FilmChapters({
  chapters,
  apiRef,
  layout = 'overlay',
  bandBottom = '0px',
}: {
  chapters: Chapter[];
  /**
   * Filled with an imperative updater.
   *
   * THE CHAPTERS ARE NOT RE-RENDERED ON SCROLL, and that is the point. Feeding
   * progress in as a prop meant React re-rendered this whole tree on every
   * scroll tick — five articles, five markers, five stations, each with fresh
   * inline styles — at up to 120 times a second, on the same main thread that
   * has to decode and paint a film frame in the same tick. React's work was not
   * wasted so much as fatally badly timed, and it showed up as judder in the
   * one place the eye is most sensitive to it.
   *
   * So the tree renders once and the scroll writes straight to the nodes. This
   * is the same trick the canvas beside it already used, applied to the type.
   */
  apiRef: RefObject<FilmChaptersHandle | null>;
  layout?: ChapterLayout;
  /** Where the film strip ends, so stacked type can start beneath it. */
  bandBottom?: string;
}) {
  const articles = useRef<(HTMLElement | null)[]>([]);
  const markers = useRef<(HTMLElement | null)[]>([]);
  const stations = useRef<(HTMLElement | null)[]>([]);
  const fill = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    apiRef,
    () => ({
      update(progress: number) {
        for (let i = 0; i < chapters.length; i += 1) {
          const c = chapters[i];
          const { o, z } = chapterState(progress, c.from, c.to);
          const hidden = o <= 0.01;

          const article = articles.current[i];
          if (article) {
            article.style.opacity = String(o);
            article.style.transform = `translate3d(0, 0, ${z.toFixed(1)}px)`;
            article.style.visibility = hidden ? 'hidden' : 'visible';
          }

          const marker = markers.current[i];
          if (marker) {
            marker.style.opacity = String(o);
            marker.style.visibility = hidden ? 'hidden' : 'visible';
          }

          const station = stations.current[i];
          if (station) {
            station.style.color =
              progress >= c.from && progress <= c.to ? STATION_ON : STATION_OFF;
          }
        }

        if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
      },
    }),
    [chapters],
  );

  const stacked = layout === 'stacked';
  const low = layout === 'bottom';
  // Both the strip and the phone-sized full-bleed frame want tighter type than
  // the desktop ramp, which is sized for a 1440px-wide composition.
  const compact = stacked || low;

  // The block below is absolutely positioned, so this wrapper has no height:
  // `items-end` lands a zero-height box on the baseline and the block must then
  // be anchored from its bottom, or it hangs off the screen. Padding here is
  // what keeps it clear of the progress rule and the scroll hint.
  const align = stacked
    ? 'items-start pt-9'
    : low
      ? 'items-end pb-[6.5rem]'
      : 'items-start pt-[16svh]';

  // The vanishing point sits where the type does, so a chapter flying forward
  // grows straight out of the page towards the reader. Left it on centre and
  // the left-aligned block would slide right as it scaled, which reads as a
  // pan rather than an approach.
  const perspectiveOrigin = compact ? '50% 50%' : '22% 42%';

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="u-shell absolute inset-x-0 bottom-0"
        style={{ top: stacked ? bandBottom : '0px' }}
      >
        <div
          className={`relative flex h-full w-full ${align}`}
          style={{ perspective: '1100px', perspectiveOrigin }}
        >
          <div className="relative w-full max-w-[40rem]">
            {chapters.map((c, i) => {
              // Rendered at rest, then never re-rendered. The first scroll tick
              // overwrites these; they exist so the opening chapter is correct
              // in the server's HTML and in the frame before any scroll.
              const { o, z } = chapterState(0, c.from, c.to);
              return (
                <article
                  key={c.id}
                  ref={(el) => {
                    articles.current[i] = el;
                  }}
                  // Chapters occupy one position, not a sequence, so the travel
                  // never reflows the layout mid-scroll.
                  className={`absolute inset-x-0 text-[var(--color-paper)] ${low ? 'bottom-0' : 'top-0'}`}
                  style={{
                    opacity: o,
                    transform: `translate3d(0, 0, ${z.toFixed(1)}px)`,
                    transformOrigin: compact ? '50% 50%' : '0% 50%',
                    visibility: o <= 0.01 ? 'hidden' : 'visible',
                    willChange: 'opacity, transform',
                  }}
                >
                  {/* Eyebrow, over the rule it hangs from. */}
                  <p className="u-label flex items-center gap-3 text-[var(--color-paper)]/55">
                    <span className="text-[var(--color-accent)]">{c.index}</span>
                    <span className="opacity-40">/</span>
                    <span>{c.label}</span>
                    <span className="h-px flex-1 bg-[var(--color-paper)]/25" />
                  </p>

                  <h2
                    className="mt-5 font-[family-name:var(--font-display)] uppercase leading-[0.94]"
                    style={{
                      fontSize: compact
                        ? 'clamp(1.5rem, 6.6vw, 2.2rem)'
                        : 'clamp(2rem, 4.4vw, 4rem)',
                      fontWeight: 300,
                      letterSpacing: '0.045em',
                    }}
                  >
                    {c.headline}
                  </h2>

                  <p className="u-label mt-5 text-[var(--color-paper)]/70">{c.sub}</p>

                  {/* The callout rule, and the annotations hung off it. */}
                  <ul className="mt-5 border-l border-[var(--color-paper)]/25 pl-4">
                    {c.specs.map((s) => (
                      <li
                        key={s}
                        className="u-label py-[0.3rem] text-[var(--color-paper)]/55"
                        style={{ fontSize: '0.625rem', letterSpacing: '0.24em' }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sheet reference, opposite corner from the title block. */}
      {!compact ? (
        <div className="u-shell pointer-events-none absolute inset-x-0 top-0">
          <div className="relative">
            {chapters.map((c, i) => {
              const { o } = chapterState(0, c.from, c.to);
              return (
                <span
                  key={c.id}
                  ref={(el) => {
                    markers.current[i] = el;
                  }}
                  className="u-label absolute right-0 top-[16svh] whitespace-nowrap text-[var(--color-paper)]/45"
                  style={{ opacity: o, visibility: o <= 0.01 ? 'hidden' : 'visible' }}
                >
                  {c.marker}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Progress rule — a hairline that fills across the film, stationed with
          the chapters it is passing, the way a drawing scales its own edge. */}
      <div className="u-shell absolute inset-x-0 bottom-0">
        <div className="relative pb-5">
          <div className="relative h-px w-full bg-[var(--color-paper)]/15">
            <div
              ref={fill}
              className="h-full origin-left bg-[var(--color-accent)]"
              style={{ transform: 'scaleX(0)' }}
            />
            {chapters.map((c) => (
              <span
                key={c.id}
                aria-hidden="true"
                className="absolute top-0 h-[5px] w-px bg-[var(--color-paper)]/30"
                style={{ left: `${c.from * 100}%` }}
              />
            ))}
          </div>

          {!compact ? (
            <div className="relative mt-2 h-3">
              {chapters.map((c, i) => (
                <span
                  key={c.id}
                  ref={(el) => {
                    stations.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="u-label absolute top-0 whitespace-nowrap"
                  style={{
                    left: `${c.from * 100}%`,
                    fontSize: '0.5625rem',
                    letterSpacing: '0.26em',
                    color: c.from <= 0 ? STATION_ON : STATION_OFF,
                  }}
                >
                  {c.index}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
