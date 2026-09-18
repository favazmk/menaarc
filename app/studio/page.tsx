import type { Metadata } from 'next';

import { Reveal } from '@/components/ui/Reveal';
import { Wordmark } from '@/components/brand/Wordmark';
import { SectionLink } from '@/components/ui/SectionLink';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { ParallaxBand } from '@/components/ui/ParallaxBand';
import { ContactCta } from '@/components/sections/ContactCta';
import { getArchiveSummary, getBandImage, getProject } from '@/lib/projects';
import { site } from '@/lib/site';

/**
 * Why the studio is shaped the way it is.
 *
 * Not what we do (that is /services) and not the order we do it in (that is
 * the process on /services) — these are the structural choices behind both,
 * which is the only thing this page can say that no other page does.
 */
const POSITIONS = [
  {
    n: '01',
    title: 'One roof, so coordination is internal',
    body: 'Architecture, MEP and the approvals run inside the same studio. When a duct fights a ceiling, that is an argument between two people who sit together — not a chain of emails between three consultancies, each waiting on the other to move first.',
  },
  {
    n: '02',
    title: 'The person who draws it stands on the site',
    body: 'No handover to a delivery team who were not in the first meeting. The intent behind a detail does not have to survive being explained to someone new, because it never leaves the person who had it.',
  },
  {
    n: '03',
    title: 'Mall work is the default, not the exception',
    body: 'Most of what we draw goes inside an operating mall: restricted working hours, landlord and mall NOCs on top of the authority submissions, and a lease date that does not move because the programme slipped. That is the normal case here, and the studio is organised around it.',
  },
];

export const metadata: Metadata = {
  title: 'Studio',
  description: `${site.legalName} — an architectural consultancy in Dubai, founded by ${site.founder.name}.`,
};

export default function StudioPage() {
  const archive = getArchiveSummary();
  // Quoted from the same list the home page counts up, so the two pages cannot
  // drift apart on the studio's headline number.
  const delivered = site.stats.find((s) => s.label === 'Projects Completed')?.value ?? '—';
  // Sourced from the archive rather than a hardcoded path, so the caption
  // cannot drift from the project it is a photograph of.
  const band = getProject('reiss-abu-dhabi');

  return (
    <>
      <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
        <DraftingGrid plan="retail" />
        <div className="u-shell relative pb-56 pt-40 md:pb-28 md:pt-52">
          <p className="u-label">Studio</p>
          <h1 className="u-display mt-6 max-w-[15ch]">
            Everyone who builds it works here.
          </h1>

          <div className="mt-16 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7 md:col-start-6">
              <p className="u-lede">
                MENAARC works on retail, F&amp;B, hospitality, corporate and residential projects
                across the UAE and the wider GCC. Architecture, MEP and the approvals sit in one
                studio and are staffed in-house — so the person who draws a project is the person
                who stands on its site, and there is no handover to a delivery team who did not
                sit in the first meeting.
              </p>
              <p className="u-lede mt-6">
                Keeping every discipline on the payroll is the expensive way to run a practice.
                It is also why nothing gets lost in the gap between the drawing and the thing that
                gets built, which is where most projects actually go wrong.
              </p>
            </div>
          </div>

          <Reveal className="mt-28 flex justify-center border-y border-[var(--hairline)] py-24">
            <Wordmark size="lg" withArabic />
          </Reveal>
        </div>
      </section>

      <section data-theme="dark" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
        <DraftingGrid plan="core" />
        {/* pb-72 on phones: the plan sits under the content there (see DraftingGrid). */}
        <div className="u-shell relative pb-72 pt-28 md:py-40">
          <Reveal>
            <p className="u-label">The practice</p>
            <h2 className="u-headline mt-6 max-w-[18ch]">
              Senior eyes on every drawing, from first sketch to handover.
            </h2>
          </Reveal>

          <dl className="mt-16 grid grid-cols-2 gap-10 border-t border-[var(--hairline)] pt-12 lg:grid-cols-4">
            <Reveal>
              <dt className="u-label">Projects delivered</dt>
              <dd className="u-display mt-4 leading-none">{delivered}</dd>
            </Reveal>

            {/* The archive is a subset of what the studio has built, so this
                column has to say which number it is quoting — otherwise it reads
                as a contradiction of the one beside it. The sectors are named
                rather than counted: the depth in each would undersell the rest. */}
            <Reveal delay={70}>
              <dt className="u-label">Published here</dt>
              <dd className="u-display mt-4 leading-none">{archive.total}</dd>
              <dd className="mt-5 space-y-1 text-[0.9375rem] leading-snug text-[var(--muted)]">
                {archive.bySector.map(({ sector }) => (
                  <span key={sector} className="block">
                    {sector}
                  </span>
                ))}
              </dd>
            </Reveal>

            <Reveal delay={140}>
              <dt className="u-label">In-house</dt>
              {/* Five values, where the other facts carry one. At u-title this
                  column ran twice the height of the row and read as the
                  section's subject rather than one fact among four. */}
              <dd className="mt-4 space-y-2 text-[1.0625rem] font-medium leading-snug tracking-[-0.01em]">
                {site.disciplines.map((d) => (
                  <span key={d} className="block">
                    {d}
                  </span>
                ))}
              </dd>
            </Reveal>

            <Reveal delay={210}>
              <dt className="u-label">Based</dt>
              <dd className="u-title mt-4">{site.region}</dd>
              <dt className="u-label mt-8">Working across</dt>
              <dd className="u-title mt-4">UAE &amp; GCC</dd>
            </Reveal>
          </dl>

          <Reveal delay={260} className="mt-14">
            <SectionLink href="/work">See the projects</SectionLink>
          </Reveal>
        </div>
      </section>

      <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell py-28 md:py-40">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal className="md:sticky md:top-32">
                <p className="u-label">How we are set up</p>
                <h2 className="u-headline mt-6 max-w-[13ch]">
                  Three decisions that shape everything else.
                </h2>
              </Reveal>
            </div>

            <ol className="md:col-span-8">
              {POSITIONS.map((position, i) => (
                <Reveal as="li" key={position.n} delay={i * 70}>
                  <div
                    className="grid gap-4 border-t border-[var(--hairline)] py-10 md:grid-cols-12 md:gap-8"
                    style={i === POSITIONS.length - 1 ? { borderBottomWidth: 1 } : undefined}
                  >
                    <span className="u-label text-[var(--color-accent)] md:col-span-2">
                      {position.n}
                    </span>
                    <div className="md:col-span-10">
                      <h3 className="u-title">{position.title}</h3>
                      <p className="u-lede mt-4">{position.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {band ? (
        <ParallaxBand
          src={getBandImage(band)}
          alt={`${band.title}${band.location ? `, ${band.location}` : ''} — by ${site.name}`}
          caption={[band.title, band.location].filter(Boolean).join(' · ')}
        />
      ) : null}

      <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell py-28 md:py-40">
          <Reveal>
            <p className="u-label">Who you deal with</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">
              The names on the drawings are the names in the room.
            </h2>
          </Reveal>

          {/* Two people, each given the same room. A founder's block twice the
              size of everyone else's says the second name is decoration. */}
          <div className="mt-20 grid gap-x-10 gap-y-16 md:grid-cols-2 md:gap-y-0">
            {site.leadership.map((person, i) => (
              <Reveal key={person.name} delay={i * 90}>
                <article className="border-t border-[var(--hairline)] pt-10">
                  <h3 className="u-title">{person.name}</h3>
                  <p className="u-label mt-3">{person.role}</p>

                  <p className="u-lede mt-8">{person.bio}</p>

                  <ul className="mt-10 space-y-3">
                    {person.credentials.map((credential) => (
                      <li
                        key={credential}
                        className="flex gap-4 text-[0.9375rem] leading-snug text-[var(--muted)]"
                      >
                        {/* A drawing-sheet tick rather than a bullet: this is a
                            list of things that are the case, not a feature list. */}
                        <span aria-hidden="true" className="mt-[0.4em] h-px w-4 flex-none bg-current" />
                        {credential}
                      </li>
                    ))}
                  </ul>

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

      <ContactCta variant="studio" />
    </>
  );
}
