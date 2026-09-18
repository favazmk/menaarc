import { Reveal } from '@/components/ui/Reveal';
import { Illustration } from '@/components/ui/Illustration';
import { SectionLink } from '@/components/ui/SectionLink';

export function StudioIntro() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal>
              <p className="u-label">The studio</p>
            </Reveal>

            {/* A drawing beside a section about how the studio designs. This
                copy is the desktop one; on a phone this column stacks above
                the headline, so the sketch would push the section's point
                below the fold — the phone copy closes the section instead. */}
            <Illustration
              src="/illustrations/shopfront-sketch.webp"
              width={1000}
              height={1250}
              delay={120}
              className="mt-12 hidden max-w-[24rem] md:block"
            />
          </div>

          <div className="md:col-span-8">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="u-headline max-w-[20ch]">
                We design spaces for everyday use, not just opening day.
              </h2>
              <SectionLink href="/studio">About the studio</SectionLink>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <p className="u-lede">
                  MENAARC is an architectural consultancy in Dubai. Concept, detailed drawings,
                  authority approvals and MEP under one roof — retail, F&amp;B, hospitality,
                  corporate and residential work across the Emirates.
                </p>
                <p className="u-lede">
                  Most of what we do is unglamorous: coordination, tolerances, a drawing set that
                  a contractor can actually build from. That discipline is what lets the visible
                  part look effortless.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              {/* Two across until there is genuinely room for four: at 768px a quarter
                  of the shell is 88px, and "Hospitality" alone needs 111px. */}
              <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-[var(--hairline)] pt-10 lg:grid-cols-4">
                {[
                  ['Based', 'Dubai, UAE'],
                  ['Sectors', 'Retail, F&B, Hospitality'],
                  ['In-house', 'Design, MEP, Approvals'],
                  ['Region', 'UAE & GCC'],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="u-label">{term}</dt>
                    <dd className="u-title mt-3">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Phones: the same sketch, after the text, smaller and centred. */}
          <Illustration
            src="/illustrations/shopfront-sketch.webp"
            width={1000}
            height={1250}
            sizes="75vw"
            className="mx-auto w-3/4 max-w-[20rem] md:hidden"
          />
        </div>
      </div>
    </section>
  );
}
