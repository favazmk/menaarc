import type { Metadata } from 'next';

import { Reveal } from '@/components/ui/Reveal';
import { Wordmark } from '@/components/brand/Wordmark';
import { Approach } from '@/components/sections/Approach';
import { ContactCta } from '@/components/sections/ContactCta';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Studio',
  description: `${site.legalName} — an architectural consultancy in Dubai, founded by ${site.founder.name}.`,
};

export default function StudioPage() {
  return (
    <>
      <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell pb-28 pt-40 md:pt-52">
          <p className="u-label">Studio</p>
          <h1 className="u-display mt-6 max-w-[15ch]">
            A small practice, deliberately.
          </h1>

          <div className="mt-16 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7 md:col-start-6">
              <p className="u-lede">
                MENAARC works on retail, hospitality and residential projects across the UAE. The
                studio is structured so that the person who draws a project is the person who
                stands on its site — there is no handover to a delivery team who did not sit in
                the first meeting.
              </p>
              <p className="u-lede mt-6">
                That limits how much work we can take. It also means nothing gets lost in the gap
                between the drawing and the thing that gets built, which is where most projects
                actually go wrong.
              </p>
            </div>
          </div>

          <Reveal className="mt-28 flex justify-center border-y border-[var(--hairline)] py-24">
            <Wordmark size="lg" withArabic />
          </Reveal>
        </div>
      </section>

      <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell py-28 md:py-40">
          <div className="grid gap-14 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <p className="u-label">Founder</p>
            </Reveal>

            <div className="md:col-span-8">
              <Reveal>
                <h2 className="u-headline">{site.founder.name}</h2>
                <p className="u-label mt-4">{site.founder.role}</p>
              </Reveal>

              <Reveal delay={80}>
                <p className="u-lede mt-10">
                  Rashid founded MENAARC to run architecture and delivery under one roof, after
                  years of watching the two get separated — and watching projects pay for it in
                  variation orders and lost programme.
                </p>
              </Reveal>

              <Reveal delay={140}>
                <ul className="mt-12 flex flex-wrap gap-8">
                  <li>
                    <a
                      href={site.founder.instagram}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="u-label u-tap hover:text-[var(--color-accent)]"
                    >
                      {site.founder.instagramHandle} ↗
                    </a>
                  </li>
                  {site.social.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="u-label u-tap hover:text-[var(--color-accent)]"
                      >
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Approach />
      <ContactCta />
    </>
  );
}
