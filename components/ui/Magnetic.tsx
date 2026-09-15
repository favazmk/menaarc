'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Nudges a child toward the pointer as it approaches, then releases it with a
 * little elastic overshoot. This is most of the site's "playful" budget — it
 * only fires on a fine pointer with motion allowed, so touch and
 * reduced-motion users get a plain, static control.
 *
 * Two constraints keep it from breaking the layout it sits in:
 *
 * 1. The shift is capped. The pull is proportional to distance, and at the edge
 *    of its range that worked out at ~20px per element — more than half the
 *    36px gap between nav items, so two neighbours pulled toward each other
 *    overlapped by 2px. The cap is deliberately smaller than half the tightest
 *    gap any Magnetic currently sits in (16px, on the 404 buttons).
 *
 * 2. It settles back whenever the pointer is out of range, not only on
 *    pointerleave. An element can be pulled by a pointer that passes nearby and
 *    never touches it — pointerleave then never fires, and it stays displaced
 *    for good. That is what left nav items sitting off-position.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 80,
  maxShift = 6,
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  /** Largest distance in px the element may travel from its layout position. */
  maxShift?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const allowed = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!allowed.matches) return;

    let displaced = false;

    const settle = () => {
      if (!displaced) return;
      displaced = false;
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const reach = radius + Math.max(rect.width, rect.height) / 2;

      if (Math.hypot(dx, dy) > reach) {
        settle();
        return;
      }

      let x = dx * strength;
      let y = dy * strength;
      const shift = Math.hypot(x, y);
      if (shift > maxShift) {
        x = (x / shift) * maxShift;
        y = (y / shift) * maxShift;
      }

      displaced = true;
      gsap.to(el, { x, y, duration: 0.5, ease: 'power3.out' });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', settle);
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', settle);
      gsap.killTweensOf(el);
    };
  }, [strength, radius, maxShift]);

  return (
    <span ref={ref} className="inline-block will-change-transform">
      {children}
    </span>
  );
}
