'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import { ALL_PLACES, MenaGlobalMap, type CityProjects } from '@/components/ui/MenaGlobalMap';
import { LOCATIONS } from '@/lib/map-data';

/** An overview first, then one button per place on the map. */
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
      className="mena-hero relative isolate bg-[var(--ground)] text-[var(--figure)]"
    >
      {/* The heading is its own block so phones can put the map between it and
          the details; from md up both sit in one column over the map. */}
      <div className="mena-hero__intro u-shell">
        <div className="max-w-[34rem] pt-16 md:pt-32">
          <Reveal>
            <p className="u-label">Global expertise</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">
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
        <div className="max-w-[34rem] pb-16 md:pb-32">
          <Reveal delay={90}>
            <dl className="mt-10 border-t border-[var(--hairline)]">
              {[
                { term: 'ESTABLISHED', value: '2019' },
                { term: 'EXPERIENCE', value: '40+ years of combined expertise across the leadership team' },
                { term: 'SPECIALISATION', value: 'F&B, Retail, Hospitality, Corporate and Residential' },
                { term: 'REACH', value: 'All seven emirates, Saudi Arabia, Kuwait, Oman, India and Singapore' },
                { term: 'APPROACH', value: 'End-to-end in-house capability — from concept to completion' }
              ].map(({ term, value }) => (
                <div
                  key={term}
                  className="grid gap-1 border-b border-[var(--hairline)] py-4 sm:grid-cols-12 sm:gap-6"
                >
                  <dt className="u-label sm:col-span-4 sm:pt-1">{term}</dt>
                  <dd className="text-[1.0625rem] leading-snug sm:col-span-8">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={140} className="mt-10 hidden md:block">
             <div className="border-t border-[var(--hairline)] pt-6">
                <p className="u-label mb-4">GLOBAL NETWORK</p>
                {chips}
             </div>
          </Reveal>

          <Reveal delay={190} className="mt-10">
            <SectionLink href="/contact">Talk to the studio</SectionLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
