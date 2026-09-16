'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/lib/use-media-query';

/**
 * A full-bleed photograph that drifts against the scroll.
 *
 * The pages away from the home film were text on flat ground, and the studio
 * already owns the only imagery that belongs on them — its own built work. The
 * drift is small on purpose: enough to separate the plane from the text above
 * and below it, not enough to become the thing you are looking at.
 *
 * Written to the element's style rather than through React state. This runs on
 * every scroll frame, and a setState there would re-render the tree at 60fps to
 * change one transform; the transform is also the only property touched, so the
 * browser can keep the work on the compositor.
 */
export function ParallaxBand({
  src,
  alt,
  caption,
  height = '68vh',
  /** Travel as a share of the band's height. The image is scaled to cover it. */
  intensity = 0.16,
}: {
  src: string;
  alt: string;
  caption?: string;
  height?: string;
  intensity?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const frameEl = frame.current;
    const imageEl = image.current;
    if (!frameEl || !imageEl) return;

    let raf = 0;
    let visible = false;

    const sample = () => {
      raf = 0;
      const box = frameEl.getBoundingClientRect();
      // -1 when the band is just below the fold, +1 when it has just left the
      // top, 0 as it crosses the centre — so the image is centred exactly when
      // the band is, whatever the band's height or the viewport's.
      const progress = (box.top + box.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2 + box.height / 2);
      const travel = progress * intensity * box.height;
      imageEl.style.transform = `translate3d(0, ${travel.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!raf && visible) raf = requestAnimationFrame(sample);
    };

    // No reason to measure a band that is nowhere near the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(frameEl);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced, intensity]);

  return (
    <div
      ref={frame}
      className="relative overflow-hidden bg-[var(--hairline)]"
      style={{ height }}
    >
      <div
        ref={image}
        className="absolute inset-0"
        // The image overhangs the frame by the travel it will make, so the
        // drift never exposes an edge.
        style={{ top: `${-intensity * 100}%`, bottom: `${-intensity * 100}%` }}
      >
        <Image src={src} alt={alt} fill sizes="100vw" quality={90} loading="lazy" className="object-cover" />
      </div>

      {caption ? (
        <>
          {/* mix-blend-difference was unreadable here: these are photographs of
              lit shopfronts, so the value under the caption swings from black
              glass to a gold sign within one word. A scrim is the only thing
              that holds at a fixed text colour. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-48"
            style={{
              background:
                'linear-gradient(to top, rgb(10 10 10 / 0.88), rgb(10 10 10 / 0.55) 30%, rgb(10 10 10 / 0.2) 62%, transparent)',
            }}
          />
          <p
            className="u-label absolute bottom-6 left-[var(--gutter)] right-[var(--gutter)] text-[var(--color-paper)]"
            style={{ textShadow: '0 1px 12px rgb(10 10 10 / 0.6)' }}
          >
            {caption}
          </p>
        </>
      ) : null}
    </div>
  );
}
