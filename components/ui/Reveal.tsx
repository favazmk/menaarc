'use client';

import { useEffect, useRef } from 'react';

/**
 * Fades and lifts a block into place the first time it enters the viewport.
 *
 * Deliberately plain CSS transitions rather than GSAP: there can be dozens of
 * these on a page, and a shared IntersectionObserver costs far less than a
 * ScrollTrigger each. Under reduced motion the element is simply visible from
 * the start — no transition, no observer.
 */

let observer: IntersectionObserver | null = null;

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', 'true');
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );
  return observer;
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'span';
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('data-revealed', 'true');
      return;
    }

    getObserver().observe(el);
    return () => getObserver().unobserve(el);
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type across the allowed tag union
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
