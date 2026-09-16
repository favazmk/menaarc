import type { Metadata } from 'next';

import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { Illustration } from '@/components/ui/Illustration';
import { ContactForm } from '@/components/sections/ContactForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${site.legalName} about a project in Dubai or the wider UAE.`,
};

export default function ContactPage() {
  return (
    <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid plan="restaurant" />
      <div className="u-shell relative pb-32 pt-40 md:pt-52">
        <p className="u-label">Contact</p>
        <h1 className="u-display mt-6 max-w-[13ch]">Start with the constraint.</h1>

        <div className="mt-20 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="u-lede">
              The budget that will not stretch, the handover date that will not move, the landlord
              condition nobody can solve. That is usually the most useful thing to open with.
            </p>

            <dl className="mt-14 space-y-8">
              <div>
                <dt className="u-label">Email</dt>
                {/* An email address is a single unbreakable token, so it can
                    only be as large as the space it actually has.

                    Sized against this column (cqw), not the viewport. A
                    viewport-relative size ignores that the column is 5 of 12
                    grid tracks: at 768px the glyphs ran 224px past their own
                    box and across the form beside them, while the box itself
                    stayed within bounds and looked correct to any box-based
                    check. */}
                <dd className="mt-3" style={{ containerType: 'inline-size' }}>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="inline-block max-w-full py-1.5 font-medium leading-tight tracking-[-0.015em] hover:text-[var(--color-accent)]"
                    style={{ fontSize: 'min(2.25rem, max(1rem, 6.5cqw))' }}
                  >
                    {site.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="u-label">Phone</dt>
                <dd className="u-title mt-3">
                  <a
                    href={`tel:${site.contact.phoneHref}`}
                    className="inline-block py-1.5 hover:text-[var(--color-accent)]"
                  >
                    {site.contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="u-label">Studio</dt>
                <dd className="u-title mt-3">{site.region}</dd>
              </div>
            </dl>

            {/* The form beside this column runs far longer than the details
                do; the sketch takes up that height instead of leaving it blank. */}
            <Illustration
              src="/illustrations/atrium-sketch.webp"
              width={1400}
              height={933}
              delay={120}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="mt-20 hidden md:block"
            />
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
