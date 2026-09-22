'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from '@/components/ui/Reveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SECTORS = [
  { name: 'Restaurants', image: '/projects/restaurants.png' },
  { name: 'Retailers', image: '/projects/retailers.png' },
  { name: 'Residential', image: '/projects/residential.png' },
  { name: 'Commercial', image: '/projects/commercial.png' },
];

export function SectorGallery() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      const getScrollAmount = () => {
        // The distance to translate is the total width of the track minus the viewport width.
        return Math.max(0, track.scrollWidth - window.innerWidth);
      };

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
      });

      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        refreshPriority: -1, // Ensure this pin is calculated AFTER the hero film pin-spacer is applied
      });

      // Force GSAP to recalculate offsets after all sibling components (like the hero) have added their pin-spacers.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      data-theme="dark" 
      className="relative overflow-hidden bg-[var(--ground)] text-[var(--figure)] h-screen flex flex-col justify-center border-t border-[var(--hairline)]"
    >
      <div className="u-shell w-full pb-12 md:pb-16 flex-shrink-0">
        <Reveal>
          <p className="u-label">Sectors</p>
          <h2 className="u-display mt-6 max-w-[20ch]">
            Built for the way people gather, work and live.
          </h2>
          <p className="u-lede mt-6 max-w-[40ch]">
            Design and delivery expertise across the spaces that shape everyday life.
          </p>
        </Reveal>
      </div>

      <div ref={trackRef} className="flex gap-4 md:gap-8 px-6 md:px-12 w-max items-center flex-shrink-0">
        {SECTORS.map((sector) => (
          <div 
            key={sector.name} 
            className="relative overflow-hidden w-[75vw] md:w-[45vw] lg:w-[40vw] h-[40vh] md:h-[45vh] flex-shrink-0 border border-[var(--hairline)]"
          >
            <Image
              src={sector.image}
              alt={sector.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 75vw, (max-width: 1024px) 45vw, 40vw"
            />
            {/* Subtle dark overlay */}
            <div className="absolute inset-0 bg-black/25 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            
            {/* Sector Name */}
            <div className="absolute inset-0 p-6 md:p-8 flex items-end">
              <h3 className="u-headline text-white drop-shadow-md">{sector.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
