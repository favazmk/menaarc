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
            isTrial ? 'md:grid-cols-[1.4fr_1fr]' : 'md:grid-cols-[1.2fr_1fr_1fr]'
          }`}
        >
          <div>
            <p className="u-label">Let&rsquo;s build something</p>
            {/* An email address is one unbreakable token, so the shared
                headline ramp overflows a phone viewport. This one gets its own
                scale, sized to fit 24 characters at 375px. */}
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-5 inline-block max-w-full py-1 font-[family-name:var(--font-display)] leading-none tracking-[-0.02em] hover:text-[var(--color-accent)]"
              style={{ fontSize: 'clamp(1.125rem, 5vw, 3rem)' }}
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
          <p className="u-label text-center md:text-right">
            {site.region}
            <span className="mx-3 opacity-40">·</span>
            &copy; {new Date().getFullYear()} {site.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
