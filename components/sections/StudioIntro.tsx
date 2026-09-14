import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

export function StudioIntro() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="u-label">The studio</p>
            <p
              className="u-arabic mt-8 text-[clamp(2.5rem,6vw,5rem)] font-light leading-none opacity-15"
              lang="ar"
              aria-hidden="true"
            >
              {site.nameArabic}
            </p>
          </Reveal>

          <div className="md:col-span-8">
            <Reveal>
              <h2 className="u-headline max-w-[20ch]">
                We draw buildings that have to work on a Tuesday morning.
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <p className="u-lede">
                  MENAARC is an architectural consultancy in Dubai. We take projects from first
                  sketch through authority approval and onto site — retail, hospitality and
                  residential work across the Emirates.
                </p>
                <p className="u-lede">
                  Most of what we do is unglamorous: coordination, tolerances, a drawing set that
                  a contractor can actually build from. That discipline is what lets the visible
                  part look effortless.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-[var(--hairline)] pt-10 md:grid-cols-4">
                {[
                  ['Based', 'Dubai, UAE'],
                  ['Practice', 'Architecture'],
                  ['Delivery', 'Design + PM'],
                  ['Region', 'GCC'],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="u-label">{term}</dt>
                    <dd className="u-title mt-3">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
