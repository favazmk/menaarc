'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import { ALL_PLACES, MenaGlobalMap, type CityProjects } from '@/components/ui/MenaGlobalMap';
import { LOCATIONS } from '@/lib/map-data';

/**
 * The region in a single screen: heading, one button per place, and the map.
 *
 * The details list that used to sit here (established, experience, sectors)
 * now lives in the introduction above, so this section only has to answer
 * "where?" — and fits in one view on a laptop instead of scrolling past it.
 */
const PLACES = [{ id: ALL_PLACES, name: 'ALL LOCATIONS' }, ...LOCATIONS];

export function GlobalExpertiseClient({ built }: { built: CityProjects[] }) {
  const [activePlace, setActivePlace] = useState(ALL_PLACES);

  const chips = (
    <div className="flex flex-wrap gap-2">
      {PLACES.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          aria-pressed={activePlace === id}
          onClick={() => setActivePlace(id)}
          className={`px-3.5 py-1.5 border rounded-full text-[0.75rem] tracking-wider transition-colors ${activePlace === id ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--hairline)] hover:border-[var(--figure)]'}`}
        >
          {name}
        </button>
      ))}
    </div>
  );

  return (
    <section
      data-theme="dark"
      className="mena-hero relative isolate bg-[var(--ground)] text-[var(--figure)] md:min-h-[100svh]"
    >
      {/* The heading is its own block so phones can put the map between it and
          the details; from md up both sit in one column over the map. */}
      <div className="mena-hero__intro u-shell">
        <div className="max-w-[36rem] pt-16 md:pt-24">
          <Reveal>
            <p className="u-label">Global expertise</p>
            <h2 className="mt-6 max-w-[18ch] font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.75rem)] leading-[0.98] tracking-[-0.025em]">
              Shaping spaces across the UAE, Saudi Arabia, Kuwait, Oman, India and Singapore.
            </h2>
          </Reveal>
        </div>
      </div>

      <div className="mena-hero__map">
        <MenaGlobalMap built={built} activePlace={activePlace} />
      </div>

      {/* Phones stack the copy under the map, which put these a screen away
          from what they change. Here they sit right under it; from md up the
          map fills the section, so they stay in the copy. */}
      <div className="u-shell pt-5 md:hidden">{chips}</div>

      <div aria-hidden="true" className="mena-hero__scrim" />

      <div className="mena-hero__content u-shell">
        <div className="max-w-[36rem] pb-16 md:pb-24">
          <Reveal delay={90} className="mt-10 hidden md:block">
            <p className="u-label mb-4">Global network</p>
            {chips}
          </Reveal>

          <Reveal delay={190} className="mt-10">
            <SectionLink href="/contact">Talk to the studio</SectionLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
