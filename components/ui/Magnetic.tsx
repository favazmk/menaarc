'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Nudges a child toward the pointer as it approaches, then releases it with a
 * little elastic overshoot. This is most of the site's "playful" budget — it
 * only fires on a fine pointer with motion allowed, so touch and
 * reduced-motion users get a plain, static control.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 80,
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const allowed = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!allowed.matches) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(dx, dy) > radius + Math.max(rect.width, rect.height) / 2) return;
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.5, ease: 'power3.out' });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, radius]);

  return (
    <span ref={ref} className="inline-block will-change-transform">
      {children}
    </span>
  );
}
