'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import type { Project } from '@/lib/projects';

const ALL = 'All';

export function WorkIndex({ projects, sectors }: { projects: Project[]; sectors: string[] }) {
  const [filter, setFilter] = useState<string>(ALL);

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.sector === filter)),
    [projects, filter],
  );

  return (
    <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid plan="core" />
      <div className="u-shell relative pb-72 pt-40 md:pb-32 md:pt-52">
        <header>
          <p className="u-label">Work</p>
          <h1 className="u-display mt-6 max-w-[12ch]">Built, not rendered.</h1>
          <p className="u-lede mt-8">
            Retail, food and beverage and hospitality delivered across Dubai, Abu Dhabi and the
            wider Emirates.
          </p>
        </header>

        <div className="mt-16 flex flex-wrap gap-3" role="group" aria-label="Filter by sector">
          {[ALL, ...sectors].map((sector) => {
            const active = filter === sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setFilter(sector)}
                aria-pressed={active}
                className="u-label rounded-full border px-5 py-2.5 transition-colors"
                style={{
                  borderColor: active ? 'var(--figure)' : 'var(--hairline)',
                  background: active ? 'var(--figure)' : 'transparent',
                  color: active ? 'var(--ground)' : 'var(--muted)',
                }}
              >
                {sector}
                <span className="ml-3 opacity-50">
                  {sector === ALL
                    ? projects.length
                    : projects.filter((p) => p.sector === sector).length}
                </span>
              </button>
            );
          })}
        </div>

        <ul className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={(i % 3) * 70}>
              <Link href={`/work/${project.slug}`} data-cursor="View" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--hairline)]">
                  <Image
                    src={project.images[0]}
                    alt={`${project.title}${project.location ? `, ${project.location}` : ''}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h2 className="u-title">{project.title}</h2>
                  <span className="u-label shrink-0">{project.sector}</span>
                </div>
                <p className="u-label mt-2">{project.location || '—'}</p>
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
