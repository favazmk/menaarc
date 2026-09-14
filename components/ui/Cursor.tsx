'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

import { useFinePointer, usePrefersReducedMotion } from '@/lib/use-media-query';

/**
 * A custom cursor: a small dot that trails the pointer and swells into a
 * labelled disc over anything marked `data-cursor="..."`.
 *
 * Renders only on a fine pointer with motion allowed. The `has-custom-cursor`
 * class on <html> is what hides the native cursor, so if this component bails
 * the real cursor is never taken away.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add('has-custom-cursor');

    const dot = dotRef.current;
    if (!dot) return;

    const x = gsap.quickTo(dot, 'x', { duration: 0.28, ease: 'power3.out' });
    const y = gsap.quickTo(dot, 'y', { duration: 0.28, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      x(event.clientX);
      y(event.clientY);
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(target?.dataset.cursor ?? null);
    };

    const onLeave = () => gsap.to(dot, { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to(dot, { opacity: 1, duration: 0.2 });

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      document.documentElement.classList.remove('has-custom-cursor');
      gsap.killTweensOf(dot);
    };
  }, [enabled]);

  if (!enabled) return null;

  const expanded = label !== null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] -translate-x-1/2 -translate-y-1/2 will-change-transform"
    >
      <div
        className="flex items-center justify-center rounded-full border border-current transition-[width,height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: expanded ? 76 : 10,
          height: expanded ? 76 : 10,
          backgroundColor: expanded ? 'transparent' : 'currentColor',
          mixBlendMode: 'difference',
          color: '#fafafa',
        }}
      >
        <span
          className="u-label text-[0.5rem] text-current transition-opacity duration-200"
          style={{ opacity: expanded ? 1 : 0, letterSpacing: '0.2em' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
