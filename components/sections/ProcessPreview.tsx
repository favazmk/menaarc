import { Reveal } from '@/components/ui/Reveal';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { SectionLink } from '@/components/ui/SectionLink';
import { process } from '@/lib/process';

/**
 * The home page's short form of the Approach section on /services.
 *
 * Four stages named in a line each, then a link to the page that explains
 * them. The full version stays on /services, where a visitor who wants the
 * detail has gone looking for it.
 */
export function ProcessPreview() {
  return (
    <section data-theme="dark" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative py-28 md:py-40">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-label">Approach</p>
            <h2 className="u-headline mt-6 max-w-[14ch]">How a project actually runs.</h2>
          </div>
          <SectionLink href="/services#process">The full process</SectionLink>
        </Reveal>

        <ol className="mt-16 grid gap-px border-t border-[var(--hairline)] md:grid-cols-4 md:border-t-0">
          {process.map((step, i) => (
            <Reveal
              as="li"
              key={step.n}
              delay={i * 70}
              className="border-b border-[var(--hairline)] py-8 md:border-b-0 md:border-t md:pr-8"
            >
              <span className="u-label text-[var(--color-accent)]">{step.n}</span>
              <h3 className="u-title mt-5">{step.title}</h3>
              <p className="u-lede mt-3">{step.short}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
