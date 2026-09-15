'use client';

import { useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { services } from '@/lib/services';

/**
 * The service list, expandable. The first row opens on load so the section
 * never reads as a bare list of headings.
 */
export function Capabilities() {
  const [open, setOpen] = useState<string | null>(services[0].id);

  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <Reveal>
          <p className="u-label">Services</p>
          <h2 className="u-headline mt-6 max-w-[16ch]">
            From the first sketch to the permit on the wall.
          </h2>
          <p className="u-lede mt-8">
            Concept, drawings, approvals and MEP under one roof — so the coordination between
            them is our problem rather than yours.
          </p>
        </Reveal>

        <div className="mt-16">
          {services.map((service, i) => {
            const isOpen = open === service.id;
            return (
              <Reveal key={service.id} delay={Math.min(i, 4) * 60}>
                <div className="border-t border-[var(--hairline)]">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : service.id)}
                      aria-expanded={isOpen}
                      aria-controls={`svc-${service.id}`}
                      className="flex w-full items-baseline justify-between gap-6 py-7 text-left"
                    >
                      <span className="flex items-baseline gap-5">
                        <span className="u-label shrink-0 text-[var(--color-accent)]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="u-headline">{service.title}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-xl leading-none transition-transform duration-500"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                      >
                        +
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`svc-${service.id}`}
                    // Grid-rows 0fr -> 1fr animates to intrinsic height without
                    // measuring, which max-height cannot do without a guess.
                    className="grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="overflow-hidden">
                      <div className="grid gap-10 pb-12 md:grid-cols-12">
                        <p className="u-lede md:col-span-5">{service.lede}</p>
                        <ul className="grid gap-x-10 gap-y-3 md:col-span-7 md:grid-cols-2">
                          {service.items.map((item) => (
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
