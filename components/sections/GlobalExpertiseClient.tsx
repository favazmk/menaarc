'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import { MenaGlobalMap, type CityProjects } from '@/components/ui/MenaGlobalMap';

const REGIONS = ['GLOBAL HUB', 'UAE', 'GCC', 'MENA', 'INDIA', 'MALAYSIA'];

export function GlobalExpertiseClient({ built }: { built: CityProjects[] }) {
  const [activeRegion, setActiveRegion] = useState('GLOBAL HUB');

  return (
    <section
      data-theme="dark"
      className="mena-hero relative isolate bg-[var(--ground)] text-[var(--figure)]"
    >
      <div className="mena-hero__map">
        <MenaGlobalMap built={built} activeRegion={activeRegion} />
      </div>

      <div aria-hidden="true" className="mena-hero__scrim" />

      <div className="mena-hero__content u-shell">
        <div className="max-w-[34rem] py-16 md:py-32">
          <Reveal>
            <p className="u-label">Global expertise</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">
              Shaping spaces across the UAE, India, Malaysia and the wider MENA region.
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <dl className="mt-10 border-t border-[var(--hairline)]">
              {[
                { term: 'ESTABLISHED', value: '2019' },
                { term: 'EXPERIENCE', value: '40+ years of combined expertise across the leadership team' },
                { term: 'SPECIALISATION', value: 'F&B, Retail, Hospitality, Corporate and Residential' },
                { term: 'REACH', value: 'The UAE, wider GCC, MENA, India and Malaysia' },
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

          <Reveal delay={140} className="mt-10">
             <div className="border-t border-[var(--hairline)] pt-6">
                <p className="u-label mb-4">GLOBAL NETWORK</p>
                <div className="flex flex-wrap gap-2">
                   {REGIONS.map(region => (
                     <button
                       key={region}
                       onClick={() => setActiveRegion(region)}
                       className={`px-4 py-2 border rounded-full text-[0.8125rem] tracking-wider transition-colors ${activeRegion === region ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--hairline)] hover:border-[var(--figure)]'}`}
                     >
                       {region}
                     </button>
                   ))}
                </div>
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
