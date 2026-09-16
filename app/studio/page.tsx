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
  // Sourced from the archive rather than a hardcoded path, so the caption
  // cannot drift from the project it is a photograph of.
  const band = getProject('reiss-abu-dhabi');

  return (
    <>
      <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
        <DraftingGrid plan="retail" />
        <div className="u-shell relative pb-28 pt-40 md:pt-52">
          <p className="u-label">Studio</p>
          <h1 className="u-display mt-6 max-w-[15ch]">
            A small practice, deliberately.
          </h1>

          <div className="mt-16 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7 md:col-start-6">
              <p className="u-lede">
                MENAARC works on retail, hospitality and residential projects across the UAE. The
                studio is structured so that the person who draws a project is the person who
                stands on its site — there is no handover to a delivery team who did not sit in
                the first meeting.
              </p>
              <p className="u-lede mt-6">
                That limits how much work we can take. It also means nothing gets lost in the gap
                between the drawing and the thing that gets built, which is where most projects
                actually go wrong.
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
        <div className="u-shell relative py-28 md:py-40">
          <Reveal>
            <p className="u-label">The practice</p>
            <h2 className="u-headline mt-6 max-w-[18ch]">
              Small enough to know every drawing on the wall.
            </h2>
          </Reveal>

          <dl className="mt-16 grid grid-cols-2 gap-10 border-t border-[var(--hairline)] pt-12 lg:grid-cols-4">
            <Reveal>
              <dt className="u-label">Projects delivered</dt>
              <dd className="u-display mt-4 leading-none">{archive.total}</dd>
            </Reveal>

            {/* Named, not counted. The archive is a subset of what the studio has
                built — the sectors it covers are the honest claim; the depth in
                each is a number that would undersell the rest. */}
            <Reveal delay={70}>
              <dt className="u-label">Published work</dt>
              <dd className="mt-4 space-y-1.5">
                {archive.bySector.map(({ sector }) => (
                  <span key={sector} className="u-title block">
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
          <div className="grid gap-14 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <p className="u-label">Founder</p>
            </Reveal>

            <div className="md:col-span-8">
              <Reveal>
                <h2 className="u-headline">{site.founder.name}</h2>
                <p className="u-label mt-4">{site.founder.role}</p>
              </Reveal>

              <Reveal delay={80}>
                <p className="u-lede mt-10">
                  Rashid founded MENAARC to run architecture and delivery under one roof, after
                  years of watching the two get separated — and watching projects pay for it in
                  variation orders and lost programme.
                </p>
              </Reveal>

              <Reveal delay={140}>
                <ul className="mt-12 flex flex-wrap gap-8">
                  <li>
                    <a
                      href={site.founder.instagram}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="u-label u-tap hover:text-[var(--color-accent)]"
                    >
                      {site.founder.instagramHandle} ↗
                    </a>
                  </li>
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
          </div>
        </div>
      </section>

      <ContactCta variant="studio" />
    </>
  );
}
