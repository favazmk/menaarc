'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import type { Project } from '@/lib/projects';
import { isTrial } from '@/lib/trial';

/**
 * The selected-work slideshow: the home page's centrepiece.
 *
 * Photographs side by side, three across on a desktop, each named in its
 * bottom-left corner. It is a native scroll-snap strip, so touch, trackpad and
 * keyboard all scroll it for free; the arrows and the slow advance are a layer
 * on top that only ever call scrollBy.
 *
 * The advance stops while a pointer or focus is on the strip, while it is off
 * screen, and for anyone who asked for reduced motion.
 */
const ADVANCE_MS = 5000;

/** Lines the first card up with the shell's left edge, however wide the screen. */
const BLEED = 'max(var(--gutter), calc((100vw - 108rem) / 2 + var(--gutter)))';

type Card = Pick<Project, 'slug' | 'title' | 'location' | 'sector' | 'images'>;

function Frame({ trial, slug, title, children }: { trial: boolean; slug: string; title: string; children: React.ReactNode }) {
  const cls = 'group relative block aspect-[4/5] overflow-hidden rounded-md bg-white/5 md:aspect-[5/4]';
  if (trial) return <div className={cls}>{children}</div>;
  return (
    <Link href={`/work/${slug}`} data-cursor="View" aria-label={title} className={cls}>
      {children}
    </Link>
  );
}

function Arrow({ dir, onClick, disabled }: { dir: 1 | -1; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? 'Next project' : 'Previous project'}
      className="grid h-12 w-12 place-items-center rounded-full border border-[var(--hairline)] text-lg transition-colors hover:border-[var(--figure)] hover:bg-[var(--figure)] hover:text-[var(--ground)] disabled:pointer-events-none disabled:opacity-30"
    >
      <span aria-hidden="true">{dir === 1 ? '→' : '←'}</span>
    </button>
  );
}

export function SelectedWork({ projects }: { projects: Card[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(false);

  /** One card's width plus the gap, so each step lands on the next snap point. */
  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const pitch = card ? card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0) : el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    // A slideshow loops: at the last card, "next" goes back to the first.
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: dir * pitch, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (held || !inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => step(1), ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [held, inView, step]);

  if (!projects.length) return null;

  return (
    <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell pt-24 md:pt-32">
        <Reveal className="flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="u-label">Selected work</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">Delivered across the Emirates.</h2>
          </div>
          <div className="flex items-center gap-3">
            <Arrow dir={-1} onClick={() => step(-1)} disabled={progress <= 0.001} />
            <Arrow dir={1} onClick={() => step(1)} disabled={false} />
            {isTrial ? null : <SectionLink href="/work" className="ml-2">All work</SectionLink>}
          </div>
        </Reveal>
      </div>

      <Reveal delay={80}>
        <ul
          ref={trackRef}
          aria-label="Selected projects"
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          onTouchStart={() => setHeld(true)}
          className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:mt-16 [&::-webkit-scrollbar]:hidden"
          style={{ paddingInline: BLEED, scrollPaddingInline: BLEED }}
        >
          {projects.map((project, i) => (
            <li
              key={project.slug}
              className="shrink-0 basis-[82%] snap-start sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]"
            >
              <Frame trial={isTrial} slug={project.slug} title={project.title}>
                <Image
                  src={project.images[0]}
                  alt={isTrial ? `${project.title}${project.location ? `, ${project.location}` : ''}` : ''}
                  fill
                  priority={i < 3}
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 via-35% to-transparent to-60%"
                />

                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white md:p-6">
                  <span>
                    <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-white/70">
                      {[project.sector, project.location].filter(Boolean).join(' · ')}
                    </span>
                    <span className="u-title mt-2 block">{project.title}</span>
                  </span>

                  {project.images.length > 1 ? (
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <rect x="8" y="3" width="13" height="13" rx="2" />
                        <path d="M16 19.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h.5" />
                      </svg>
                      <span className="sr-only">Photographs:</span>
                      {project.images.length}
                    </span>
                  ) : null}
                </span>
              </Frame>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="u-shell pb-24 pt-8 md:pb-32">
        <div aria-hidden="true" className="h-px w-full bg-[var(--hairline)]">
          <div
            className="h-px bg-[var(--color-accent)] transition-[width] duration-300"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
