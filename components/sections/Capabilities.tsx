'use client';

import { useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';

const CAPABILITIES = [
  {
    id: 'design',
    title: 'Design',
    lede: 'Concept through to a construction set a contractor can build from.',
    items: [
      'Concept and schematic design',
      'Design development',
      'Interior architecture',
      'Detailed drawings and specification',
      'Material and finishes schedules',
      '3D visualisation',
    ],
  },
  {
    id: 'project-management',
    title: 'Project Management',
    lede: 'Someone accountable for the programme, the budget and the site.',
    items: [
      'Programme and cost planning',
      'Tendering and contractor selection',
      'Authority approvals and NOCs',
      'Site supervision and snagging',
      'MEP and specialist coordination',
      'Handover and close-out',
    ],
  },
] as const;

/**
 * Two disciplines, expandable. Not an accordion that hides everything by
 * default — the first row opens on load so the page never reads as an empty
 * list of headings.
 */
export function Capabilities() {
  const [open, setOpen] = useState<string | null>(CAPABILITIES[0].id);

  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <Reveal>
          <p className="u-label">Capabilities</p>
          <h2 className="u-headline mt-6 max-w-[14ch]">Two disciplines, one accountability.</h2>
        </Reveal>

        <div className="mt-16">
          {CAPABILITIES.map((cap, i) => {
            const isOpen = open === cap.id;
            return (
              <Reveal key={cap.id} delay={i * 80}>
                <div className="border-t border-[var(--hairline)]">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : cap.id)}
                      aria-expanded={isOpen}
                      aria-controls={`cap-${cap.id}`}
                      className="flex w-full items-baseline justify-between gap-6 py-8 text-left"
                    >
                      <span className="u-headline">{cap.title}</span>
                      <span
                        aria-hidden="true"
                        className="u-label shrink-0 transition-transform duration-500"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                      >
                        +
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`cap-${cap.id}`}
                    // Grid-rows 0fr -> 1fr animates to intrinsic height without
                    // measuring, which max-height cannot do without a guess.
                    className="grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="overflow-hidden">
                      <div className="grid gap-10 pb-12 md:grid-cols-12">
                        <p className="u-lede md:col-span-5">{cap.lede}</p>
                        <ul className="grid gap-x-10 gap-y-3 md:col-span-7 md:grid-cols-2">
                          {cap.items.map((item) => (
                            <li key={item} className="flex gap-4 text-[var(--figure)]">
                              <span aria-hidden="true" className="text-[var(--color-accent)]">
                                —
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
          <div className="border-t border-[var(--hairline)]" />
        </div>
      </div>
    </section>
  );
}
