'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import type { Project } from '@/lib/projects';
import { sectorName } from '@/lib/services';

const ALL = 'All';

export function WorkIndex({ projects, sectors }: { projects: Project[]; sectors: string[] }) {
  const [filter, setFilter] = useState<string>(ALL);

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.sector === filter)),
    [projects, filter],
  );

  return (
    <section data-theme="dark" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative pb-72 pt-40 md:pb-32 md:pt-52">
        <header>
          <p className="u-label">MENAARC / Work</p>
          <h1 className="u-display mt-6">Selected projects.</h1>
          <p className="u-lede mt-8">
            A portfolio of architectural and interior projects across retail, hospitality and
            commercial environments.
          </p>
        </header>

        <div className="mt-14 flex flex-wrap gap-3" role="group" aria-label="Filter by sector">
          {[ALL, ...sectors].map((sector) => {
            const active = filter === sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setFilter(sector)}
                aria-pressed={active}
                className="rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: active ? 'var(--figure)' : 'var(--hairline)',
                  background: active ? 'var(--figure)' : 'transparent',
                  color: active ? 'var(--ground)' : 'var(--muted)',
                }}
              >
                {sector === ALL ? 'All projects' : sectorName(sector)}
              </button>
            );
          })}
        </div>

        <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:gap-x-8">
          {visible.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={(i % 2) * 70}>
              <Link href={`/work/${project.slug}`} data-cursor="View" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[var(--hairline)]">
                  <Image
                    src={project.cover ?? project.images[0]}
                    alt={`${project.title}${project.location ? `, ${project.location}` : ''}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>

                <h2 className="mt-5 text-[1.375rem] font-medium leading-tight tracking-[-0.01em]">
                  {project.title}
                </h2>
                <p className="mt-1.5 text-[0.9375rem] text-[var(--muted)]">
                  {[sectorName(project.sector), project.location].filter(Boolean).join(' · ')}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>

        {!visible.length ? (
          <p className="u-lede mt-16">No projects in this sector yet.</p>
        ) : null}
      </div>
    </section>
  );
}
