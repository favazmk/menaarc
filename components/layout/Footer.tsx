import Link from 'next/link';

import { Wordmark } from '@/components/brand/Wordmark';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { site } from '@/lib/site';
import { isTrial } from '@/lib/trial';
import { openers, whatsappHref } from '@/lib/whatsapp';

/**
 * Contact first, then the index, then the mark itself — drawn edge to edge
 * across the shell and fading into the ground, as the last thing on every page.
 */
export function Footer() {
  return (
    <footer data-theme="dark" className="relative overflow-hidden bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell pt-20 md:pt-28">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-10">
          {/* container-type makes cqw below resolve against this column. */}
          <div className="col-span-2 md:col-span-5" style={{ containerType: 'inline-size' }}>
            <p className="u-label">Let&rsquo;s build something</p>
            {/* An email address is one unbreakable token, so it can only be as
                large as the space it actually has — sized in cqw against this
                column rather than vw, which ignored the grid track and ran the
                glyphs across the columns beside it between 768px and 1200px.
                6.5cqw leaves roughly an eighth of the column spare. */}
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-5 inline-block max-w-full py-1 font-[family-name:var(--font-display)] leading-none tracking-[-0.02em] transition-colors hover:text-[var(--color-accent)]"
              style={{ fontSize: 'min(3rem, max(1rem, 6.5cqw))' }}
            >
              {site.contact.email}
            </a>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={whatsappHref(openers.home)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--figure)] px-6 py-3 text-sm text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
              <a
                href={`tel:${site.contact.phoneHref}`}
                className="inline-flex items-center rounded-full border border-[var(--hairline)] px-6 py-3 text-sm transition-colors hover:border-[var(--figure)]"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>

          {isTrial ? null : (
            <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
              <p className="u-label">Site</p>
              <ul className="mt-5 space-y-2.5">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-lg transition-colors hover:text-[var(--color-accent)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className={isTrial ? 'md:col-span-2 md:col-start-7' : 'md:col-span-2'}>
            <p className="u-label">Elsewhere</p>
            <ul className="mt-5 space-y-2.5">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex items-center gap-2 text-lg transition-colors hover:text-[var(--color-accent)]"
                  >
                    {s.label}
                    <span aria-hidden="true" className="text-sm opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2">
            <p className="u-label">Studio</p>
            <p className="mt-5 text-lg leading-snug">
              Dubai,
              <span className="block text-[var(--muted)]">United Arab Emirates</span>
            </p>
          </div>
        </div>

        {/* The mark, edge to edge, sinking into the ground. Sized in cqw
            against the shell, so it is exactly as wide as the content above
            it at every screen width. */}
        <div
          className="pt-16 [mask-image:linear-gradient(to_bottom,black_30%,transparent_105%)] md:pt-24"
          style={{ containerType: 'inline-size' }}
        >
          <Wordmark size="fluid" className="w-full" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-[var(--hairline)] py-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="u-label">
            &copy; {new Date().getFullYear()} {site.legalName}
          </p>
          <p className="u-label">
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
          <a href="#top" className="u-label transition-colors hover:text-[var(--figure)]">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
