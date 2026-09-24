'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GuideMascot } from './GuideMascot';

type Stop = {
  id: string;
  says: string;
};

const STOPS: Stop[] = [
  { id: 'clients', says: 'Mall operators let us on site. Brands let us draw their units. In this business you need both.' },
  { id: 'region', says: 'The filled markers are places with a finished project in them — somewhere you could go and stand.' },
  { id: 'stats', says: 'Six years, and that many projects, out of one office. What it looks like is the next thing down.' },
  { id: 'work', says: 'Every photograph here is a finished unit. There is not one render on this page.' },
  { id: 'studio', says: 'Everything from the first sketch to the site walk happens in this office. Nothing gets handed over.' },
  { id: 'services', says: 'Concept, detailed drawings, authority approvals, MEP, project management. Five things, one roof.' },
  { id: 'process', says: 'A mall lease date does not move. So the programme is the first thing we draw, before the plan.' },
  { id: 'contact', says: 'Send a message and you reach the studio, not a form queue. Usually the same day.' },
];

const BY_ID = new Map(STOPS.map((s) => [s.id, s]));

/** Viewport px kept clear at the top for the fixed header. */
const HEADER_CLEARANCE = 96;
/** Gap from the viewport corner when there is no heading to sit on. */
const CORNER_INSET = 20;
/** Share of the figure's height below the boot soles (the jet flames). */
const BOOT_LIFT = 0.19;

/**
 * Where the guide's feet go on a heading: on top of its first line, near the
 * line's right end, so it stands on the letters rather than over them.
 */
function perchOn(heading: HTMLElement, range: Range) {
  range.selectNodeContents(heading);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0);
  if (!rects.length) return null;
  const top = Math.min(...rects.map((r) => r.top));
  const firstLine = rects.filter((r) => r.top < top + 4);
  const right = Math.max(...firstLine.map((r) => r.right));
  // Text boxes start at the ascender; the caps begin a little lower.
  const size = parseFloat(getComputedStyle(heading).fontSize) || 16;
  return { x: right, y: top + size * 0.14 };
}

export function SiteGuide() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [activeStop, setActiveStop] = useState<Stop | null>(STOPS[0]);
  const [isWaving, setIsWaving] = useState(false);

  // Auto-close note when clicking outside or scrolling
  useEffect(() => {
    if (!openFor) return;
    const close = () => setOpenFor(null);
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && event.target instanceof Node && rootRef.current.contains(event.target)) return;
      close();
    };
    window.addEventListener('scroll', close, { passive: true });
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', close);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openFor]);

  // Track the most visible section using IntersectionObserver
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-guide]');
    if (!targets.length) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.guide;
          if (id) ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: string | null = null;
        let best = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > best) {
            best = ratio;
            bestId = id;
          }
        }

        const next = bestId ? (BY_ID.get(bestId) ?? null) : null;
        if (next) {
          setActiveStop(next);
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * The guide sits on a main heading for as long as any of that heading is on
   * screen, riding along with it as the page scrolls. Only once the heading has
   * gone completely does it leave: for the next heading in view, or else for
   * the bottom-left corner, where it waits for one to appear.
   *
   * Flights are slow on purpose: eased, and capped in speed, so a long trip
   * reads as flying rather than as a jump.
   */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = reduced ? 1 : 0.03;
    /** Top speed in px per frame, about 180px a second. */
    const maxStep = reduced ? Infinity : 3;
    const lerpTilt = 0.08;
    const range = document.createRange();

    let rafId = 0;
    let currX = 0;
    let currY = 0;
    let currTilt = 0;
    let first = true;
    let flying = false;
    /** The heading it sits on or is flying to; null means the corner. */
    let spot: HTMLElement | null = null;
    let prevSpot: HTMLElement | null = null;
    let landTimer = 0;

    const onScreen = (h: HTMLElement, height: number) => {
      const r = h.getBoundingClientRect();
      return r.bottom > HEADER_CLEARANCE && r.top < height;
    };

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const el = rootRef.current;
      const route = document.querySelector('[data-guide-route]');
      if (!el || !route) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const scale = width < 768 ? 0.8 : 1;
      const figure = el.querySelector<HTMLElement>('.site-guide__button');
      const figW = (figure?.offsetWidth ?? 112) * scale;
      const figH = (figure?.offsetHeight ?? 144) * scale;

      // Hidden over the film; it appears once the page proper begins.
      const shown = route.getBoundingClientRect().top < height * 0.6;
      el.style.opacity = shown ? '1' : '0';
      el.style.visibility = shown ? 'visible' : 'hidden';
      el.style.pointerEvents = shown ? 'auto' : 'none';

      // Keep the current heading while any of it is visible; otherwise take
      // the first heading whose top line is on screen.
      if (!spot || !onScreen(spot, height)) {
        spot = null;
        for (const heading of route.querySelectorAll<HTMLElement>('h2')) {
          const p = perchOn(heading, range);
          if (p && p.y > HEADER_CLEARANCE && p.y < height * 0.92) {
            spot = heading;
            break;
          }
        }
      }
      const target = spot ? perchOn(spot, range) : null;

      const half = figW / 2 + 8;
      const tx = target
        ? Math.min(width - half, Math.max(half, target.x - figW * 0.3))
        : CORNER_INSET + figW / 2;
      // The boots sit a fifth of the figure above its bottom edge, the jet
      // flames filling the rest; drop by that much so the boots are what land.
      // Riding a heading up the screen, it stops short of the header rather
      // than sliding underneath it and vanishing while the heading still shows.
      const ty = target
        ? Math.max(target.y + figH * BOOT_LIFT, HEADER_CLEARANCE + figH)
        : height - CORNER_INSET + figH * BOOT_LIFT;

      if (first) {
        currX = tx;
        currY = ty;
        first = false;
      } else if (spot !== prevSpot) {
        flying = true;
        window.clearTimeout(landTimer);
        el.removeAttribute('data-arriving');
      }
      prevSpot = spot;

      const dx = tx - currX;
      const dy = ty - currY;
      let vx = 0;
      let vy = 0;
      if (flying) {
        const dist = Math.hypot(dx, dy);
        const step = Math.min(dist * ease, maxStep);
        vx = dist ? (dx / dist) * step : 0;
        vy = dist ? (dy / dist) * step : 0;
        currX += vx;
        currY += vy;
        if (dist < 1.5) {
          flying = false;
          currX = tx;
          currY = ty;
          el.setAttribute('data-arriving', '');
          landTimer = window.setTimeout(() => el.removeAttribute('data-arriving'), 900);
        }
      } else {
        currX = tx;
        currY = ty;
      }

      currTilt += (Math.max(-9, Math.min(9, vx * 1.6)) - currTilt) * lerpTilt;
      el.style.transform = `translate3d(${currX.toFixed(2)}px, ${currY.toFixed(2)}px, 0) scale(${scale}) rotate(${currTilt.toFixed(2)}deg)`;

      el.classList.toggle('is-traveling', flying);
      // The note opens toward the middle of the screen.
      const side = currX > width / 2 ? 'left' : 'right';
      if (el.dataset.side !== side) el.dataset.side = side;

      // Face the way it flies across; a mostly vertical flight stays front-on.
      // Turning needs a clearer sideways heading than staying turned does, so
      // a diagonal flight does not flick between views.
      const sideways = el.dataset.pose === 'front' ? 0.9 : 0.4;
      const pose =
        flying && Math.abs(vx) > Math.abs(vy) * sideways ? (vx > 0 ? 'right' : 'left') : 'front';
      if (el.dataset.pose !== pose) el.dataset.pose = pose;
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(landTimer);
    };
  }, []);

  if (pathname !== '/') return null;

  const open = openFor === activeStop?.id;

  const handleMascotClick = () => {
    // Wave arm when tapped
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1600);

    // Toggle note
    setOpenFor(open ? null : (activeStop?.id ?? null));
  };

  return (
    <div
      ref={rootRef}
      className="site-guide"
      data-theme="dark"
      data-open={open || undefined}
      data-waving={isWaving || undefined}
      data-pose="front"
      style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }}
    >
      <p className="site-guide__bubble" role="status">
        {activeStop?.says}
      </p>

      <button
        type="button"
        className="site-guide__button"
        aria-expanded={open}
        onClick={handleMascotClick}
      >
        <span className="sr-only">
          {open ? 'Hide the note about this section' : 'A note about this section'}
        </span>
        <span aria-hidden="true" className="site-guide__shadow" />
        <GuideMascot className="site-guide__figure" />
      </button>
    </div>
  );
}
