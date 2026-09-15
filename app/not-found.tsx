import type { Metadata } from 'next';
import Link from 'next/link';

import { Magnetic } from '@/components/ui/Magnetic';
import { getFeaturedProjects } from '@/lib/projects';
import { site } from '@/lib/site';
import { isTrial } from '@/lib/trial';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * Replaces Next's unstyled default, which rendered bare system type inside the
 * site chrome. A dead URL is still a brand impression, so it gets the same
 * treatment as any other page — and a way back rather than a dead end.
 */
export default function NotFound() {
  const suggestions = getFeaturedProjects(3);

  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell flex min-h-[100svh] flex-col justify-center pb-28 pt-40">
        <p className="u-label">404</p>
        <h1 className="u-display mt-6 max-w-[16ch]">This one isn&rsquo;t built yet.</h1>
        <p className="u-lede mt-8">
          The page you asked for does not exist, or has moved. Nothing is broken on your end.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <Magnetic strength={0.25}>
            <Link
              href="/"
             
              className="inline-block rounded-full bg-[var(--figure)] px-9 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
            >
              Back to the start
            </Link>
          </Magnetic>
          {isTrial ? null : (
            <Magnetic strength={0.25}>
              <Link
                href="/work"
                className="inline-block rounded-full border border-[var(--hairline)] px-9 py-4 transition-colors hover:border-[var(--figure)]"
              >
                See the work
              </Link>
            </Magnetic>
          )}
        </div>

        {suggestions.length && !isTrial ? (
          <div className="mt-20 border-t border-[var(--hairline)] pt-10">
            <p className="u-label">Or start here</p>
            <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
              {suggestions.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-cursor="View"
                    className="u-title inline-block py-1 hover:text-[var(--color-accent)]"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="u-label mt-16">
          Still stuck?{' '}
          <a
            href={`mailto:${site.contact.email}`}
            className="u-tap break-all underline underline-offset-4 hover:text-[var(--color-accent)]"
          >
            {site.contact.email}
          </a>
        </p>
      </div>
    </section>
  );
}
