import { Reveal } from '@/components/ui/Reveal';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { SectionLink } from '@/components/ui/SectionLink';
import { delivery, design, processIntro } from '@/lib/process';

/**
 * The home page's short form of the process section on /services.
 *
 * The six design stages with their week and a line each, then one line for
 * the separately appointed delivery services, then a link to the page that
 * gives the deliverables. The full version stays on /services, where a
 * visitor who wants the detail has gone looking for it.
 */
export function ProcessPreview() {
  return (
    <section data-theme="dark" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative py-28 md:py-40">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-label">Our process</p>
            <h2 className="u-headline mt-6 max-w-[14ch]">{processIntro.headline}</h2>
          </div>
          <SectionLink href="/services#process">The full process</SectionLink>
        </Reveal>

        <Reveal className="mt-16 flex items-baseline justify-between gap-6">
          <p className="u-label">
            {design.n} / {design.title}
          </p>
          <p className="u-label">{design.term}</p>
        </Reveal>

        <ol className="mt-6 grid gap-px border-t border-[var(--hairline)] md:grid-cols-3 md:gap-x-8 md:border-t-0">
          {design.stages.map((stage, i) => (
            <Reveal
              as="li"
              key={stage.n}
              delay={(i % 3) * 70}
              className="border-b border-[var(--hairline)] py-8 md:border-b-0 md:border-t"
            >
              <span className="u-label text-[var(--color-accent)]">
                {stage.n} · {stage.when}
              </span>
              <h3 className="u-title mt-5">{stage.title}</h3>
              <p className="u-lede mt-3">{stage.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12 border-t border-[var(--hairline)] pt-6">
          <p className="u-lede">
            <span className="u-label mr-3">
              {delivery.n} / {delivery.title}
            </span>
            {delivery.intro.replace(/\.$/, '')}: {delivery.stages.map((s) => s.title).join(', ')}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
