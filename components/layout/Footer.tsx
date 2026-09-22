import Link from 'next/link';

import { Wordmark } from '@/components/brand/Wordmark';
import { site } from '@/lib/site';
import { isTrial } from '@/lib/trial';

export function Footer() {
  return (
    <footer data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-20 md:py-28">
        <div
          className={`grid gap-14 ${
            isTrial ? 'md:grid-cols-[1.4fr_1fr]' : 'md:grid-cols-[1.5fr_1fr_1fr]'
          }`}
        >
          {/* container-type makes cqw below resolve against this column. */}
          <div style={{ containerType: 'inline-size' }}>
            <p className="u-label">Let&rsquo;s build something</p>
            {/* An email address is one unbreakable token, so it can only be as
                large as the space it actually has.
                
                Sized in cqw — against this column — not vw. A viewport-relative
                size ignores that the column is a 1.2fr track of a three-column
                grid, so between roughly 768px and 1200px the glyphs ran out of
                the column and across the nav beside it. The box was capped by
                max-w-full and looked fine to any box-based measurement; only
                the painted text overflowed.
                
                6.5cqw leaves roughly an eighth of the column spare at every width, so
                a longer address than this one still fits. */}
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-5 inline-block max-w-full py-1 font-[family-name:var(--font-display)] leading-none tracking-[-0.02em] hover:text-[var(--color-accent)]"
              style={{ fontSize: 'min(3rem, max(1rem, 6.5cqw))' }}
            >
              {site.contact.email}
            </a>
            <p className="u-lede mt-5">
              <a
                href={`tel:${site.contact.phoneHref}`}
                className="inline-block py-1.5 hover:text-[var(--figure)]"
              >
                {site.contact.phone}
              </a>
            </p>
          </div>

          {isTrial ? null : (
          <nav aria-label="Footer">
            <p className="u-label">Site</p>
            <ul className="mt-5 space-y-2">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="u-title hover:text-[var(--color-accent)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          )}

          <div>
            <p className="u-label">Elsewhere</p>
            <ul className="mt-5 space-y-2">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="u-title hover:text-[var(--color-accent)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="u-rule my-14" />

        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <Wordmark size="md" withArabic />
          <div className="flex flex-col items-center gap-2 md:items-end">
            <p className="u-label text-center md:text-right">
              {site.region}
              <span className="mx-3 opacity-40">·</span>
              &copy; {new Date().getFullYear()} {site.legalName}
            </p>
            <p className="u-label text-center md:text-right opacity-60">
              Website by{' '}
              <a 
                href="https://webbranding.ae" 
                target="_blank" 
                rel="noreferrer noopener" 
                className="transition-colors hover:text-purple-500"
              >
                Web Branding
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
