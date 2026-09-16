import Link from 'next/link';

import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import { services } from '@/lib/services';

/**
 * The home page's short form of /services.
 *
 * Deliberately not the Capabilities accordion: the home page should say what
 * the five services are and then send you somewhere to read them properly. A
 * second copy of the full list here is what made /services a page the visitor
 * had already seen. Static and server-rendered, so the home page does not pay
 * for the scroll listener that drives the real thing.
 */
export function ServicesPreview() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-label">Services</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">
              From the first sketch to the permit on the wall.
            </h2>
          </div>
          <SectionLink href="/services">All five services</SectionLink>
        </Reveal>

        <ul className="mt-16">
          {services.map((service, i) => (
            <Reveal as="li" key={service.id} delay={Math.min(i, 4) * 60}>
              <Link
                href={`/services#${service.id}`}
                data-cursor="Open"
                className="group grid gap-x-8 gap-y-2 border-t border-[var(--hairline)] px-2 py-7 transition-colors duration-300 hover:bg-[var(--hairline)] md:grid-cols-12"
              >
                <span className="u-label text-[var(--color-accent)] md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="u-title flex items-center gap-3 transition-colors group-hover:text-[var(--color-accent)] md:col-span-4">
                  {service.title}
                  <span
                    aria-hidden="true"
                    className="text-base opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </h3>
                <p className="u-lede md:col-span-7">{service.lede}</p>
              </Link>
            </Reveal>
          ))}
          <li className="border-t border-[var(--hairline)]" />
        </ul>
      </div>
    </section>
  );
}
