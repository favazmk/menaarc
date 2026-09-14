import Link from 'next/link';

import { Reveal } from '@/components/ui/Reveal';
import { Magnetic } from '@/components/ui/Magnetic';
import { site } from '@/lib/site';
import { isTrial } from '@/lib/trial';

export function ContactCta() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-32 md:py-48">
        <Reveal className="flex flex-col items-center text-center">
          <p className="u-label">Next project</p>
          <h2 className="u-display mt-8 max-w-[14ch]">Tell us what you&rsquo;re building.</h2>
          <p className="u-lede mt-8 max-w-[46ch] text-center">
            Send the brief, the site, or just the constraint you cannot get past. We will tell you
            honestly whether we are the right studio for it.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
            {/* The contact page is not published on a home-only build, so the
                primary action becomes the email it would have led to. */}
            <Magnetic strength={0.25}>
              {isTrial ? (
                <a
                  href={`mailto:${site.contact.email}`}
                  className="inline-block rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
                >
                  Start a conversation
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="inline-block rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
                >
                  Start a conversation
                </Link>
              )}
            </Magnetic>

            <Magnetic strength={0.25}>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-block rounded-full border border-[var(--hairline)] px-10 py-4 transition-colors hover:border-[var(--figure)]"
              >
                {site.contact.email}
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
