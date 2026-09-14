import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/ui/Reveal';
import type { Project } from '@/lib/projects';
import { isTrial } from '@/lib/trial';

/**
 * The selected-work band.
 *
 * Rows rather than a grid: the archive's photography is inconsistent in
 * quality and aspect, and a row layout carries that unevenness far better than
 * a grid, which advertises every mismatch.
 */
const ROW_CLASS =
  'group grid items-center gap-6 border-t border-[var(--hairline)] py-8 md:grid-cols-12 md:gap-10';

function Row({
  trial,
  slug,
  children,
}: {
  trial: boolean;
  slug: string;
  children: React.ReactNode;
}) {
  if (trial) return <div className={ROW_CLASS}>{children}</div>;
  return (
    <Link href={`/work/${slug}`} data-cursor="View" className={ROW_CLASS}>
      {children}
    </Link>
  );
}

export function SelectedWork({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;

  return (
    <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <Reveal className="flex items-end justify-between gap-8">
          <div>
            <p className="u-label">Selected work</p>
            <h2 className="u-headline mt-6 max-w-[16ch]">Delivered across the Emirates.</h2>
          </div>
          {isTrial ? null : (
            <Link
              href="/work"
              className="u-label u-tap shrink-0 hover:text-[var(--color-accent)]"
            >
              View all
            </Link>
          )}
        </Reveal>

        <ul className="mt-20">
          {projects.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={i * 60}>
              {/* On a home-only build the case studies are not published, so
                  the row is presented as a static entry rather than a link to
                  a page that would 404. The alt text carries the project name
                  in that case, since no link text names the image. */}
              <Row trial={isTrial} slug={project.slug}>
                <span className="u-label md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="u-title md:col-span-4 md:text-[clamp(1.75rem,3vw,2.75rem)]">
                  {project.title}
                </span>

                <span className="u-label md:col-span-3">{project.location || '—'}</span>
                <span className="u-label md:col-span-2">{project.sector || '—'}</span>

                <span className="relative aspect-[16/10] overflow-hidden md:col-span-2">
                  <Image
                    src={project.images[0]}
                    alt={isTrial ? `${project.title}${project.location ? `, ${project.location}` : ''}` : ''}
                    fill
                    sizes="(max-width: 768px) 100vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </span>
              </Row>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
