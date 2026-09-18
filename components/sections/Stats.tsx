'use client';

import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

/**
 * The four numbers, counted up once as the band arrives.
 *
 * The count is the only thing here that needs script, so it is the only thing
 * that degrades: the markup ships the final value, and the effect replaces it
 * with a running one. Anyone with script off, reduced motion on, or a failed
 * hydration sees the real figure immediately rather than a zero that never
 * moves — the usual failure of this pattern.
 */

/** '200+' -> { target: 200, suffix: '+' } */
function parse(value: string) {
  const match = /^(\d+)(.*)$/.exec(value);
  if (!match) return { target: null as number | null, suffix: value };
  return { target: Number(match[1]), suffix: match[2] };
}

/** Fast at first, settling at the end — a number arriving, not a slot machine. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-9 * t));

const DURATION = 1600;

function Counter({ value }: { value: string }) {
  const { target, suffix } = parse(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el === null || target === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let start = 0;
    let armed = false; // the band has been scrolled to; the count is owed
    let done = false;

    const step = (now: number) => {
      start ||= now;
      const t = Math.min(1, (now - start) / DURATION);
      setShown(Math.round(easeOutExpo(t) * target));
      if (t < 1) raf = requestAnimationFrame(step);
      else done = true;
    };

    const run = () => {
      // requestAnimationFrame does not tick in a background tab. Starting there
      // would write the first frame — a zero — and then never advance it, which
      // is how a stats band ends up reading "0+ Projects Completed" for anyone
      // who opened the page in a background tab and came back to it.
      if (done || document.hidden) return;
      start = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (!document.hidden) {
        // Only if the band was already reached — otherwise the count would run
        // itself off-screen and be over before anyone scrolled to it.
        if (armed) run();
        return;
      }
      // Leaving mid-count freezes the digits wherever they had got to, so land
      // on the real figure rather than on a number that was never true.
      cancelAnimationFrame(raf);
      if (armed && !done) {
        done = true;
        setShown(target);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        armed = true;
        run();
      },
      { threshold: 0.4 },
    );

    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span ref={ref} className="inline-flex items-start">
      {/* Tabular figures: without them the digits change width as they count
          and the whole row jitters. */}
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {shown === null ? (target ?? value) : shown}
      </span>
      {suffix ? (
        <span aria-hidden="true" className="text-[0.44em] leading-[1.6] text-[var(--muted)]">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

export function Stats() {
  return (
    // Same ink ground as the work above it, and no top padding to speak of:
    // the numbers are the scale of the projects a visitor has just scrolled
    // through, so they should read as that section's last line rather than as
    // a new claim on a fresh ground.
    <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell pb-24 pt-4 md:pb-32 md:pt-6">
        {/* Centred in each column rather than flush left. Four figures of very
            different widths — 6, 200, 100, 40 — hang off a left edge as a
            ragged row; centred, each one sits under the middle of its own rule
            and the four read as a set. */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-14 text-center lg:grid-cols-4">
          {site.stats.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="border-t border-[var(--hairline)] pt-6">
                <dd className="u-display flex justify-center leading-[0.85]">
                  <Counter value={value} />
                </dd>
                <dt className="u-label mt-5">{label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
