import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/ui/Reveal';
import type { Project } from '@/lib/projects';

/**
 * The selected-work band.
 *
 * Rows rather than a grid: the archive's photography is inconsistent in
 * quality and aspect, and a row layout carries that unevenness far better than
 * a grid, which advertises every mismatch.
 */
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
          <Link
            href="/work"
            data-cursor="All work"
            className="u-label shrink-0 pb-2 hover:text-[var(--color-accent)]"
          >
            View all
          </Link>
        </Reveal>

        <ul className="mt-20">
          {projects.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={i * 60}>
              <Link
                href={`/work/${project.slug}`}
                data-cursor="View"
                className="group grid items-center gap-6 border-t border-[var(--hairline)] py-8 md:grid-cols-12 md:gap-10"
              >
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
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
