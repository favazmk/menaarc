'use client';

import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { services } from '@/lib/services';
import { usePrefersReducedMotion } from '@/lib/use-media-query';

/**
 * The service list, opening itself as you scroll.
 *
 * A row is open when its heading has passed above the middle of the viewport,
 * and closes again on the way back up. Stated as a pure function of scroll
 * position it is also a stable one, which the obvious version is not:
 *
 * Keeping exactly one row open — whichever heading is nearest the centre —
 * oscillates. A panel is around 250px and the headings sit about 110px apart,
 * so closing row N while opening row N+1 drags row N+1's heading 250px up past
 * the centre, which leaves row N+2 nearest it, which repeats the whole thing.
 * Opening without closing cannot do that: a row's panel hangs below its own
 * heading, so expanding it only pushes the rows beneath it further away.
 *
 * Clicking still toggles a row by hand, and a hand-set row stays that way until
 * you actually scroll it across the middle — the scroll pass only writes when
 * a row's own answer changes, not on every frame.
 *
 * The home page deep-links at a single service (/services#mep-drawing). Opening
 * the row needs no code: the browser lands it near the top of the viewport,
 * above the middle, so the rule above catches it. Landing *on* it does — every
 * row the jump passed opens too, and each panel pushes the target further down,
 * about 500px by the fifth service. So we anchor once more after those panels
 * have been laid out. Under reduced motion the listener is off, nothing expands,
 * and the browser's own jump is already correct.
 */
export function Capabilities() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set([services[0].id]));
  const headings = useRef(new Map<string, HTMLElement>());

  // Re-anchor after the rows the jump passed have expanded — see the note above.
  // Scroll only; the open state is already settled by the pass below.
  useEffect(() => {
    if (reduced) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (!el) return;

    // Two frames: one for the scroll pass to write the open set, one for the
    // panels it opened to be laid out at their real height.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    });
    return () => {
      cancelAnimationFrame(first);
      if (second) cancelAnimationFrame(second);
    };
  }, [reduced]);

  useEffect(() => {
    // Reduced motion keeps the click-only accordion. Expanding a panel while
    // the page scrolls is movement the visitor did not ask for, and it shifts
    // everything below it.
    if (reduced) return;

    let frame = 0;
    const was = new Map<string, boolean>();

    const sample = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      const flipped: Array<[string, boolean]> = [];

      for (const [id, el] of headings.current) {
        const box = el.getBoundingClientRect();
        const past = box.top + box.height / 2 < middle;
        if (was.get(id) !== past) {
          was.set(id, past);
          flipped.push([id, past]);
        }
      }

      if (flipped.length === 0) return;

      setOpen((current) => {
        const next = new Set(current);
        for (const [id, past] of flipped) {
          if (past) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    };

    const onScroll = () => {
      // getBoundingClientRect forces layout, so coalesce to one read per frame.
      if (!frame) frame = requestAnimationFrame(sample);
    };

    frame = requestAnimationFrame(sample);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

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
            const isOpen = open.has(service.id);
            return (
              <Reveal key={service.id} delay={Math.min(i, 4) * 60}>
                <div id={service.id} className="scroll-mt-28 border-t border-[var(--hairline)]">
                  <h3>
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) headings.current.set(service.id, el);
                        else headings.current.delete(service.id);
                      }}
                      onClick={() =>
                        setOpen((current) => {
                          const next = new Set(current);
                          if (!next.delete(service.id)) next.add(service.id);
                          return next;
                        })
                      }
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
