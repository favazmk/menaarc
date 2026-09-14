'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

import { useFinePointer, usePrefersReducedMotion } from '@/lib/use-media-query';

/**
 * A custom cursor: a small dot that trails the pointer and swells into a
 * labelled disc over anything marked `data-cursor="..."`.
 *
 * Inverts against whatever is behind it via `mix-blend-mode: difference`, so it
 * stays visible over white editorial pages, the dark footer, and a
 * continuously-changing film frame alike — without sampling pixels.
 *
 * The blend lives on the same element GSAP transforms, and that placement is
 * load-bearing. A blended element composites against its own stacking context,
 * and `transform` (or `will-change: transform`) creates one for its
 * descendants. An earlier version put the blend on a child of the transformed
 * wrapper, so it blended against an empty context and rendered at its literal
 * near-white — invisible on exactly the light backgrounds it was meant to
 * invert against.
 *
 * Mounts only on a fine pointer with motion allowed. The `has-custom-cursor`
 * class on <html> is what hides the native cursor, so if this component bails
 * the real cursor is never taken away.
 */
export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add('has-custom-cursor');

    const el = cursorRef.current;
    if (!el) return;

    const x = gsap.quickTo(el, 'x', { duration: 0.28, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.28, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      x(event.clientX);
      y(event.clientY);
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(target?.dataset.cursor ?? null);
    };

    const onLeave = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to(el, { opacity: 1, duration: 0.2 });

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      document.documentElement.classList.remove('has-custom-cursor');
      gsap.killTweensOf(el);
    };
  }, [enabled]);

  if (!enabled) return null;

  const expanded = label !== null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] -translate-x-1/2 -translate-y-1/2"
      style={{
        // White differenced against the backdrop: black on white, white on
        // black, and the inverse of whatever the film is showing.
        mixBlendMode: 'difference',
        color: '#ffffff',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-current transition-[width,height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: expanded ? 76 : 12,
          height: expanded ? 76 : 12,
          backgroundColor: expanded ? 'transparent' : 'currentColor',
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
