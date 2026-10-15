import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Reveal } from '@/components/ui/Reveal';
import { ContactCta } from '@/components/sections/ContactCta';
import { getAllProjects, getCity, getImageSize, getNextProject, getProject } from '@/lib/projects';
import { sectorName } from '@/lib/services';
import { site } from '@/lib/site';
import { projectOpener } from '@/lib/whatsapp';

type Params = { params: Promise<{ slug: string }> };

type Photo = { src: string; width: number; height: number };
type Row = { kind: 'full' | 'pair' | 'half'; images: Photo[]; aspect: string };

const isPortrait = (p: Photo) => p.height > p.width;

/**
 * Lays the photographs out by shape, so nothing is cropped against its grain.
 *
 * A landscape hero runs full width; the rest go in pairs, and a pair takes the
 * shape its two photographs share — two verticals stand tall, two landscapes
 * sit wide, a mixed pair meets in the middle at a square. A landscape left
 * over at the end runs full width; a vertical left over keeps its half.
 */
function galleryRows(photos: Photo[]): Row[] {
  const rows: Row[] = [];
  const rest = [...photos];
  const full = (p: Photo): Row => ({
    kind: 'full',
    images: [p],
    aspect: String(Math.min(Math.max(p.width / p.height, 4 / 3), 16 / 9)),
  });

  if (rest[0] && !isPortrait(rest[0])) rows.push(full(rest.shift()!));

  while (rest.length > 1) {
    const pair = rest.splice(0, 2);
    const tall = pair.filter(isPortrait).length;
    rows.push({ kind: 'pair', images: pair, aspect: tall === 2 ? '4 / 5' : tall === 0 ? '4 / 3' : '1 / 1' });
  }

  if (rest[0]) rows.push(isPortrait(rest[0]) ? { kind: 'half', images: rest, aspect: '4 / 5' } : full(rest[0]));
  return rows;
}

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const where = project.location ? `, ${project.location}` : '';
  return {
    title: `${project.title}${where}`,
    description: project.summary || `${project.title}${where} — a project by ${site.name}.`,
    openGraph: { images: project.images[0] ? [project.images[0]] : [] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getNextProject(slug);

  const city = getCity(project);
  const where =
    city && !project.location.endsWith(city) ? `${project.location}, ${city}` : project.location;
  const sector = sectorName(project.sector);

  // Only render facts the client has actually supplied. An empty row would
  // advertise that we do not know, which is worse than a shorter table.
  const facts = [
    ['Project', project.title],
    ['Location', where],
    ['Sector', sector],
    ['Year', project.year],
    ['Area', project.area],
    ['Scope', project.scope.join(' / ')],
    ['Status', 'Completed'],
  ].filter(([, value]) => Boolean(value));

  const rows = galleryRows(
    await Promise.all(project.images.map(async (src) => ({ src, ...(await getImageSize(src)) }))),
  );
  const alt = `${project.title}${project.location ? `, ${project.location}` : ''}`;

  return (
    <>
      <article data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell pt-40 md:pt-52">
          <Link href="/work" className="u-label u-tap hover:text-[var(--color-accent)]">
            ← Work
          </Link>

          <header className="mt-10 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <h1 className="u-display">{project.title}</h1>
              <p className="mt-5 text-[var(--muted)]">
                {[where, sector].filter(Boolean).join(' | ')}
              </p>
            </div>

            <div className="md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
              {project.summary ? <p className="u-lede">{project.summary}</p> : null}

              <Reveal>
                <dl className="mt-10 border-t border-[var(--hairline)]">
                  {facts.map(([term, value]) => (
                    <div
                      key={term}
                      className="grid grid-cols-12 gap-4 border-b border-[var(--hairline)] py-3.5"
                    >
                      <dt className="u-label col-span-4 pt-1 sm:col-span-3">{term}</dt>
                      <dd className="col-span-8 sm:col-span-9">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </header>
        </div>

        <div className="u-shell mt-20 md:mt-24">
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
            {rows.flatMap((row, r) =>
              row.images.map((img, i) => (
                <Reveal
                  as="li"
                  key={img.src}
                  delay={i * 70}
                  className={row.kind === 'full' ? 'md:col-span-2' : ''}
                >
                  <div
                    className="relative overflow-hidden rounded-lg bg-[var(--hairline)]"
                    style={{ aspectRatio: row.aspect }}
                  >
                    <Image
                      src={img.src}
                      alt={r === 0 && i === 0 ? alt : ''}
                      fill
                      priority={r === 0}
                      sizes={row.kind === 'full' ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              )),
            )}
          </ul>
        </div>

        {next ? (
          <div className="u-shell mt-32 pb-32">
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center justify-between gap-8 border-t border-[var(--hairline)] py-12"
            >
              <div>
                <p className="u-label">Next project</p>
                <p className="u-headline mt-4 transition-colors group-hover:text-[var(--color-accent)]">
                  {next.title}
                </p>
              </div>
              <span aria-hidden="true" className="u-headline">
                →
              </span>
            </Link>
          </div>
        ) : null}
      </article>

      {/* A case study is where a visitor is most likely to think "one like
          that", so the conversation opens with the project they were on. */}
      <ContactCta variant="project" message={projectOpener(project.title, project.location)} />
    </>
  );
}
