import { Reveal } from '@/components/ui/Reveal';
import { SectionLink } from '@/components/ui/SectionLink';
import { MenaMap, type CityProjects } from '@/components/ui/MenaMap';
import { MENA_CITIES } from '@/lib/mena-map';
import { getProjectsByCity } from '@/lib/projects';
import { site } from '@/lib/site';

/**
 * The key to the two kinds of marker, and — below the md breakpoint — the only
 * place the names are legible at all.
 *
 * On a phone the frame is around 400px across and twelve labels collide into
 * noise, so the map hides them and the names live here instead.
 *
 * It also does a job the map alone could not: a filled marker and a hollow one
 * look like a design flourish until something says which is which.
 */
function Legend({ built, reach }: { built: string[]; reach: string[] }) {
  return (
    <dl className="mt-8 grid gap-6 border-t border-[var(--hairline)] pt-6 sm:grid-cols-2">
      <div>
        <dt className="u-label flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 flex-none rounded-full bg-[var(--color-accent)]"
          />
          Projects delivered
        </dt>
        <dd className="mt-3 text-[0.9375rem] leading-snug text-[var(--muted)]">
          {built.join(' · ')}
        </dd>
      </div>

      <div>
        <dt className="u-label flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 flex-none rounded-full border border-[var(--figure)]"
          />
          Working across
        </dt>
        <dd className="mt-3 text-[0.9375rem] leading-snug text-[var(--muted)]">
          {reach.join(' · ')}
        </dd>
      </div>
    </dl>
  );
}

/**
 * Where the studio works.
 *
 * Laid out as a hero rather than as a column pair: the map is the full bleed of
 * the section and the copy sits over it behind a gradient, which is the shape
 * the reference for this section uses. It earns that treatment because the map
 * carries the argument: the pins land as you arrive, the filled ones are places
 * with a finished project, and opening one gives you the projects in that city.
 * It is a drawing that responds, not a map you navigate — see MenaMap for why
 * panning and zooming were taken out.
 *
 * Below md the overlay is dropped and the two stack. Text over a map on a
 * 390px screen leaves neither the text readable nor the markers reachable, and
 * the map needs its own height there to be worth showing at all.
 */
export function GlobalExpertise() {
  // Which places the archive can actually back, derived rather than declared —
  // an earlier version had Sharjah marked as delivered with nothing there.
  const byCity = getProjectsByCity();
  const built: CityProjects[] = byCity.map(({ city, projects }) => ({
    city,
    projects: projects.map((p) => ({ slug: p.slug, title: p.title, location: p.location })),
  }));

  const builtNames = new Set(built.map((b) => b.city));
  const reachNames = MENA_CITIES.filter((c) => !builtNames.has(c.name)).map((c) => c.name);

  return (
    <section
      data-theme="dark"
      className="mena-hero relative isolate bg-[var(--ground)] text-[var(--figure)]"
    >
      <div className="mena-hero__map">
        <MenaMap built={built} />
      </div>

      {/* Scrim. Pointer-events off, so every marker underneath it stays
          reachable — it dims the drawing, it does not cover it. */}
      <div aria-hidden="true" className="mena-hero__scrim" />

      <div className="mena-hero__content u-shell">
        <div className="max-w-[34rem] py-20 md:py-16">
          <Reveal>
            <p className="u-label">Global expertise</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">
              Shaping spaces across the Emirates and the wider MENA region.
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <dl className="mt-10 border-t border-[var(--hairline)]">
              {site.expertise.map(({ term, value }) => (
                <div
                  key={term}
                  className="grid gap-1 border-b border-[var(--hairline)] py-4 sm:grid-cols-12 sm:gap-6"
                >
                  <dt className="u-label sm:col-span-4 sm:pt-1">{term}</dt>
                  <dd className="text-[1.0625rem] leading-snug sm:col-span-8">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={140}>
            <Legend built={built.map((b) => b.city)} reach={reachNames} />
          </Reveal>

          <Reveal delay={190} className="mt-10">
            <SectionLink href="/contact">Talk to the studio</SectionLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
