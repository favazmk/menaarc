import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Reveal } from '@/components/ui/Reveal';
import { ContactCta } from '@/components/sections/ContactCta';
import { getAllProjects, getNextProject, getProject } from '@/lib/projects';
import { site } from '@/lib/site';
import { projectOpener } from '@/lib/whatsapp';

type Params = { params: Promise<{ slug: string }> };

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

  // Only render facts the client has actually supplied. An empty row would
  // advertise that we do not know, which is worse than a shorter table.
  const facts = [
    ['Client', project.client],
    ['Location', project.location],
    ['Sector', project.sector],
    ['Year', project.year],
    ['Area', project.area],
  ].filter(([, value]) => Boolean(value));

  return (
    <>
      <article data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell pt-40 md:pt-52">
          <Link href="/work" className="u-label u-tap hover:text-[var(--color-accent)]">
            ← Work
          </Link>

          <header className="mt-10 grid gap-10 md:grid-cols-12">
            <h1 className="u-display md:col-span-7">{project.title}</h1>
            <div className="md:col-span-5 md:pt-4">
              {project.summary ? <p className="u-lede">{project.summary}</p> : null}
            </div>
          </header>
        </div>

        <div className="u-shell mt-16">
          <div className="relative aspect-[16/9] overflow-hidden bg-[var(--hairline)]">
            <Image
              src={project.images[0]}
              alt={`${project.title}${project.location ? `, ${project.location}` : ''}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>

        {facts.length ? (
          <div className="u-shell mt-16">
            <Reveal>
              <dl className="grid grid-cols-2 gap-8 border-t border-[var(--hairline)] pt-10 md:grid-cols-5">
                {facts.map(([term, value]) => (
                  <div key={term}>
                    <dt className="u-label">{term}</dt>
                    <dd className="u-title mt-3">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        ) : null}

        {project.body.length ? (
          <div className="u-shell mt-20">
            <Reveal className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-7 md:col-start-6">
                {project.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="u-lede mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        ) : null}

        {project.images.length > 1 ? (
          <div className="u-shell mt-24">
            <ul className="grid gap-6 md:grid-cols-2">
              {project.images.slice(1).map((src, i) => (
                <Reveal
                  as="li"
                  key={src}
                  delay={(i % 2) * 70}
                  // Every third image runs full width, so a long gallery of
                  // uneven phone photography still has a rhythm to it.
                  className={i % 3 === 2 ? 'md:col-span-2' : ''}
                >
                  <div
                    className="relative overflow-hidden bg-[var(--hairline)]"
                    style={{ aspectRatio: i % 3 === 2 ? '16 / 9' : '4 / 3' }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      loading="lazy"
                      sizes={i % 3 === 2 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}

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
