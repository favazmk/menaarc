import type { Metadata } from 'next';

import { ContactForm } from '@/components/sections/ContactForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${site.legalName} about a project in Dubai or the wider UAE.`,
};

export default function ContactPage() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell pb-32 pt-40 md:pt-52">
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
                <dd className="u-title mt-3">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="hover:text-[var(--color-accent)]"
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
                    className="hover:text-[var(--color-accent)]"
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
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
