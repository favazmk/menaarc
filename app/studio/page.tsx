import type { Metadata } from 'next';

import { Reveal } from '@/components/ui/Reveal';
import { Wordmark } from '@/components/brand/Wordmark';
import { SectionLink } from '@/components/ui/SectionLink';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { ParallaxBand } from '@/components/ui/ParallaxBand';
import { ContactCta } from '@/components/sections/ContactCta';
import { getBandImage, getProject } from '@/lib/projects';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Studio',
  description: `${site.legalName} — an architectural consultancy in Dubai, founded by ${site.founder.name}.`,
};

export default function StudioPage() {
  // Quoted from the same list the home page counts up, so the two pages cannot
  // drift apart on the studio's headline number.
  const delivered = site.stats.find((s) => s.label === 'Projects Completed')?.value ?? '—';
  const brands = site.stats.find((s) => s.label === 'Brands Delivered')?.value ?? '—';
  const years = site.stats.find((s) => s.label === 'Years of Experience')?.value ?? '—';
  // Sourced from the archive rather than a hardcoded path, so the caption
  // cannot drift from the project it is a photograph of.
  const band = getProject('sushi-art-jbr');

  return (
    <>
      <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
        <DraftingGrid plan="retail" />
        <div className="u-shell relative pb-56 pt-40 md:pb-28 md:pt-52">
          <p className="u-label">The studio</p>
          <h1 className="u-display mt-6 max-w-[18ch]">Design thinking. Built understanding.</h1>
          <p className="u-lede mt-6">
            An architectural practice bringing design, technical expertise and project delivery
            together.
          </p>

          <div className="mt-16 grid gap-12 md:grid-cols-12">
            <div className="space-y-6 text-[1.0625rem] leading-relaxed md:col-span-7 md:col-start-6">
              <p>
                MENAARC is a Dubai-based architectural consultancy working across retail,
                hospitality, food and beverage, workplace and residential environments.
              </p>
              <p className="text-[var(--muted)]">
                Our practice brings together architectural design, technical expertise and project
                delivery experience. We believe that thoughtful design must be supported by a clear
                understanding of how spaces are built, operated and experienced.
              </p>
              <p className="text-[var(--muted)]">
                From the earliest design decisions to detailed coordination and implementation, our
                approach connects creative thinking with practical delivery, ensuring that design
                intent is carried through every stage of a project.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell py-20 md:py-28">
          <Reveal>
            <p className="u-label">Leadership</p>
            <h2 className="u-headline mt-6">The people behind MENAARC</h2>
          </Reveal>

          {/* Two people, each given the same room. A founder's block twice the
              size of everyone else's says the second name is decoration. */}
          <div className="mt-20 grid gap-x-10 gap-y-16 md:grid-cols-2 md:gap-y-0">
            {site.leadership.map((person, i) => (
              <Reveal key={person.name} delay={i * 90}>
                <article className="border-t border-[var(--hairline)] pt-10">
                  <h3 className="u-title">{person.name}</h3>
                  <p className="u-label mt-3">{person.role}</p>

                  <div className="mt-8 space-y-5 text-base leading-relaxed text-[var(--muted)]">
                    {person.bio.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  <ul className="mt-10 flex flex-wrap gap-8">
                    {person.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="u-label u-tap hover:text-[var(--color-accent)]"
                        >
                          {link.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <ul className="mt-20 flex flex-wrap gap-8 border-t border-[var(--hairline)] pt-10">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="u-label u-tap hover:text-[var(--color-accent)]"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section data-theme="dark" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
        <DraftingGrid plan="core" />
        {/* pb-72 on phones: the plan sits under the content there (see DraftingGrid). */}
        <div className="u-shell relative pb-72 pt-20 md:py-28">
          <Reveal>
            <p className="u-label">The practice</p>
            <h2 className="u-headline mt-6 max-w-[30ch]">
              Our experience combines creative design, technical coordination and practical
              knowledge gained through projects across the UAE and wider region.
            </h2>
          </Reveal>

          {/* Four facts at one scale in a ruled panel, then the disciplines as
              one line beneath — a list beside single numbers read as lopsided. */}
          <Reveal className="mt-14">
            <dl className="grid grid-cols-2 border-l border-t border-[var(--hairline)] lg:grid-cols-4">
              {[
                { term: 'Projects delivered', value: delivered },
                { term: 'Brands served', value: brands },
                { term: 'Years of experience', value: years },
                { term: 'Dubai-based, working across', value: 'UAE & GCC' },
              ].map((fact) => (
                <div
                  key={fact.term}
                  className="flex flex-col-reverse justify-between gap-8 border-b border-r border-[var(--hairline)] p-6 md:p-8"
                >
                  <dt className="u-label">{fact.term}</dt>
                  <dd className="u-headline leading-none">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-4 border-x border-b border-[var(--hairline)] p-6 md:flex-row md:items-center md:gap-10 md:p-8">
              <p className="u-label shrink-0">In-house</p>
              <ul className="flex flex-wrap gap-2">
                {site.disciplines.map((d) => (
                  <li
                    key={d}
                    className="rounded-full border border-[var(--hairline)] px-4 py-1.5 text-[0.9375rem]"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={260} className="mt-12">
            <SectionLink href="/work">See the projects</SectionLink>
          </Reveal>
        </div>
      </section>

      {band ? (
        <ParallaxBand
          src={getBandImage(band)}
          alt={`${band.title}${band.location ? `, ${band.location}` : ''} — by ${site.name}`}
          caption={[band.title, band.location].filter(Boolean).join(' · ')}
        />
      ) : null}

      <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell py-12 md:py-16">
          <Reveal className="flex justify-center py-6">
            <Wordmark size="lg" withArabic />
          </Reveal>
        </div>
      </section>

      <ContactCta variant="studio" />
    </>
  );
}
