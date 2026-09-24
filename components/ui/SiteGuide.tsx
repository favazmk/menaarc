'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GuideMascot } from './GuideMascot';

type Stop = {
  id: string;
  says: string;
  side: 'left' | 'right';
};

const STOPS: Stop[] = [
  { id: 'clients', says: 'Mall operators let us on site. Brands let us draw their units. In this business you need both.', side: 'left' },
  { id: 'region', says: 'The filled markers are places with a finished project in them — somewhere you could go and stand.', side: 'right' },
  { id: 'stats', says: 'Six years, and that many projects, out of one office. What it looks like is the next thing down.', side: 'left' },
  { id: 'work', says: 'Every photograph here is a finished unit. There is not one render on this page.', side: 'right' },
  { id: 'studio', says: 'Everything from the first sketch to the site walk happens in this office. Nothing gets handed over.', side: 'left' },
  { id: 'services', says: 'Concept, detailed drawings, authority approvals, MEP, project management. Five things, one roof.', side: 'right' },
  { id: 'process', says: 'A mall lease date does not move. So the programme is the first thing we draw, before the plan.', side: 'left' },
  { id: 'contact', says: 'Send a message and you reach the studio, not a form queue. Usually the same day.', side: 'left' },
];

const BY_ID = new Map(STOPS.map((s) => [s.id, s]));

// Configuration for each section waypoint
// Each section target specifies viewport percentage position and scale
type SectionConfig = {
  x: number;
  y: number;
  scale: number;
};

const DESKTOP_CONFIG: Record<string, SectionConfig> = {
  clients:  { x: 0.86, y: 0.84, scale: 1.0 },
  region:   { x: 0.16, y: 0.72, scale: 0.85 },
  stats:    { x: 0.86, y: 0.80, scale: 0.95 },
  work:     { x: 0.16, y: 0.68, scale: 0.85 },
  studio:   { x: 0.86, y: 0.84, scale: 1.0 },
  services: { x: 0.16, y: 0.74, scale: 0.85 },
  process:  { x: 0.86, y: 0.78, scale: 0.9 },
  contact:  { x: 0.86, y: 0.84, scale: 1.0 },
};

const MOBILE_CONFIG: Record<string, SectionConfig> = {
  clients:  { x: 0.82, y: 0.88, scale: 0.75 },
  region:   { x: 0.18, y: 0.88, scale: 0.7 },
  stats:    { x: 0.82, y: 0.88, scale: 0.75 },
  work:     { x: 0.18, y: 0.88, scale: 0.7 },
  studio:   { x: 0.82, y: 0.88, scale: 0.75 },
  services: { x: 0.18, y: 0.88, scale: 0.7 },
  process:  { x: 0.82, y: 0.88, scale: 0.75 },
  contact:  { x: 0.82, y: 0.88, scale: 0.75 },
};

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

  // Section-aware Continuous Physics Engine
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(85vw, 85vh, 0) translate(-50%, -100%) scale(1)`;
      }
      return;
    }

    let rafId: number;
    let currX = window.innerWidth * 0.86;
    let currY = window.innerHeight * 0.84;
    let currScale = 1.0;
    let currTilt = 0;
    let firstFrame = true;

    // Smooth physical lerp coefficients
    const lerpPos = 0.055;
    const lerpTilt = 0.08;

    // We store a ref to activeStop to access it inside the loop without restarting the loop
    let currentStopId = STOPS[0].id;

    const loop = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      const width = window.innerWidth;
      const isMobile = width < 768;
      const configMap = isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;

      // Locate all marked sections dynamically
      const sectionElements = STOPS.map((s) => ({
        id: s.id,
        el: document.querySelector(`[data-guide="${s.id}"]`) as HTMLElement | null,
      })).filter((item): item is { id: string; el: HTMLElement } => item.el !== null);

      const el = rootRef.current;
      if (!el || sectionElements.length === 0) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      // 1. Determine Hero visibility boundary
      const firstSection = sectionElements[0].el;
      const firstSectionTop = firstSection.getBoundingClientRect().top + scrollY;
      const heroThreshold = firstSectionTop - height * 0.4;
      const isPastHero = scrollY >= heroThreshold;

      if (!isPastHero) {
        if (el.style.opacity !== '0') {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        }
      } else {
        if (el.style.opacity !== '1') {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
        }
      }

      // 2. Measure center-to-center distances to each section
      const viewportCenter = scrollY + height * 0.5;

      const milestones = sectionElements.map((item) => {
        const box = item.el.getBoundingClientRect();
        const center = box.top + scrollY + box.height * 0.5;
        return {
          id: item.id,
          center,
          config: configMap[item.id] || { x: 0.85, y: 0.85, scale: 1 },
        };
      });

      // 3. Calculate continuous Target based on Scroll Progress (no instant snapping)
      let startNode = milestones[0];
      let endNode = milestones[milestones.length - 1];
      let t = 0;

      if (viewportCenter <= milestones[0].center) {
        startNode = milestones[0];
        endNode = milestones[0];
        t = 0;
      } else if (viewportCenter >= milestones[milestones.length - 1].center) {
        startNode = milestones[milestones.length - 1];
        endNode = milestones[milestones.length - 1];
        t = 1;
      } else {
        for (let i = 0; i < milestones.length - 1; i++) {
          if (viewportCenter >= milestones[i].center && viewportCenter <= milestones[i + 1].center) {
            startNode = milestones[i];
            endNode = milestones[i + 1];
            const span = endNode.center - startNode.center;
            t = span > 0 ? (viewportCenter - startNode.center) / span : 0;
            break;
          }
        }
      }

      // Smooth cosine easing across the actual distance between the two sections
      const ease = (1 - Math.cos(t * Math.PI)) / 2;

      // The TARGET changes smoothly as you scroll
      const targetX = (startNode.config.x + (endNode.config.x - startNode.config.x) * ease) * width;
      const targetY = (startNode.config.y + (endNode.config.y - startNode.config.y) * ease) * height;
      const targetScale = startNode.config.scale + (endNode.config.scale - startNode.config.scale) * ease;

      const nearestId = t < 0.5 ? startNode.id : endNode.id;
      if (currentStopId !== nearestId) {
        currentStopId = nearestId;
        setActiveStop(BY_ID.get(nearestId) || null);
      }

      if (firstFrame) {
        currX = targetX;
        currY = targetY;
        currScale = targetScale;
        firstFrame = false;
      }

      const dx = targetX - currX;
      const dy = targetY - currY;

      // 4. Smooth Animation Loop moving Current towards Target
      currX += dx * lerpPos;
      currY += dy * lerpPos;
      currScale += (targetScale - currScale) * lerpPos;

      const velocityX = dx * lerpPos;
      const targetTilt = Math.max(-9, Math.min(9, velocityX * 0.9));
      currTilt += (targetTilt - currTilt) * lerpTilt;

      const x = currX.toFixed(2);
      const y = currY.toFixed(2);
      const s = currScale.toFixed(3);
      const tilt = currTilt.toFixed(2);

      // We removed `translate(-50%, -100%)` because the mascot anchor is now handled by absolute positioning in CSS
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s}) rotate(${tilt}deg)`;

      const speed = Math.abs(velocityX) + Math.abs(dy * lerpPos);
      if (speed > 0.4) {
        if (!el.classList.contains('is-traveling')) el.classList.add('is-traveling');
      } else {
        if (el.classList.contains('is-traveling')) el.classList.remove('is-traveling');
      }

      // 5. Face the way it flies: side views across, the back view going up.
      // A higher bar to leave the front pose than to return to it, so a speed
      // hovering at the threshold does not flick between views.
      const velocityY = dy * lerpPos;
      const flying = speed > (el.dataset.pose === 'front' ? 0.6 : 0.25);
      const pose = !flying
        ? 'front'
        : Math.abs(velocityX) > Math.abs(velocityY) * 0.7
          ? velocityX > 0
            ? 'right'
            : 'left'
          : velocityY < 0
            ? 'back'
            : 'front';
      if (el.dataset.pose !== pose) el.dataset.pose = pose;

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
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
      data-side={activeStop?.side ?? 'left'}
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
