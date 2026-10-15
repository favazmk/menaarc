import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import { Wordmark } from '@/components/brand/Wordmark';
import { isTrial } from '@/lib/trial';

/**
 * Who the studio is, straight after the film: the mark, the three words, and
 * one paragraph a stranger can take in without scrolling.
 *
 * This is the short form of /studio and /services together. The sectors and
 * the in-house disciplines each get one line here instead of a section of
 * their own, which is what lets the home page stay an introduction rather
 * than a summary of every other page.
 *
 * Paper, not ink: the film's closing fog settles on paper, so the pin
 * releases into this ground without a cut.
 */
const FACTS = [
  { term: 'Sectors', value: 'Hospitality, F&B, Retail, Workplace & Residential' },
  { term: 'Expertise', value: 'Architecture, Interior Design, Technical Design & Project Delivery' },
];

function Stop() {
  return <span className="text-[var(--color-accent)]">.</span>;
}

export function HomeIntro() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-24 md:py-36">
        <Reveal className="flex flex-col items-center text-center">
          <Wordmark size="xl" withArabic />
          <p className="mt-12 text-[clamp(0.8rem,1.6vw,1.125rem)] font-medium uppercase tracking-[0.32em] text-[var(--muted)] md:mt-16">
            Architecture<Stop /> Design<Stop /> Delivery<Stop />
          </p>
        </Reveal>

        <div className="mt-20 grid gap-10 border-t border-[var(--hairline)] pt-12 md:mt-28 md:grid-cols-12 md:gap-10 md:pt-16">
          <Reveal className="md:col-span-6">
            <p className="u-label">The practice</p>
            <h2 className="u-headline mt-6 max-w-[14ch]">From design vision to built reality.</h2>
          </Reveal>

          <Reveal delay={100} className="md:col-span-6 md:pt-14">
            <p className="u-lede">
              MENAARC is a Dubai-based architectural consultancy specialising in architecture,
              interiors and project delivery. We bring creative vision and technical expertise
              together to deliver thoughtfully designed spaces, from initial concept through to
              completion.
            </p>

            <dl className="mt-10 border-t border-[var(--hairline)]">
              {FACTS.map(({ term, value }) => (
                <div
                  key={term}
                  className="grid gap-1 border-b border-[var(--hairline)] py-4 sm:grid-cols-12 sm:gap-6"
                >
                  <dt className="u-label sm:col-span-3 sm:pt-1">{term}</dt>
                  <dd className="text-[1.0625rem] leading-snug sm:col-span-9">{value}</dd>
                </div>
              ))}
            </dl>

            {isTrial ? null : (
              <div className="mt-10 flex flex-wrap gap-3">
                <SectionLink href="/studio">Explore the studio</SectionLink>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
