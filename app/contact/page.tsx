import type { Metadata } from 'next';

import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { ContactForm } from '@/components/sections/ContactForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${site.legalName} about a project in Dubai or the wider UAE.`,
};

export default function ContactPage() {
  return (
    <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid plan="restaurant" mobilePlan={false} />
      <div className="u-shell relative pb-32 pt-40 md:pt-52">
        <p className="u-label">Contact / MENAARC</p>
        <h1 className="u-display mt-6 max-w-[20ch]">Let&rsquo;s talk about your project.</h1>
        <p className="u-lede mt-6">
          Whether you&rsquo;re planning a new development, launching a retail or hospitality
          concept, or transforming an existing space, we&rsquo;d be pleased to hear from you.
        </p>

        <div className="mt-16 grid gap-16 border-t border-[var(--hairline)] pt-12 md:grid-cols-12">
          <dl className="space-y-8 md:col-span-5">
            <div>
              <dt className="u-label">Email</dt>
              <dd className="mt-2 text-base font-medium">
                <a href={`mailto:${site.contact.email}`} className="break-all hover:text-[var(--color-accent)]">
                  {site.contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="u-label">Telephone</dt>
              <dd className="mt-2 text-base font-medium">
                <a href={`tel:${site.contact.phoneHref}`} className="hover:text-[var(--color-accent)]">
                  {site.contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="u-label">Studio</dt>
              <dd className="mt-2 text-base font-medium">{site.region}</dd>
            </div>
            <div>
              <dt className="u-label">Social</dt>
              <dd className="mt-2 flex flex-wrap gap-6 text-base font-medium">
                {site.social.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-[var(--color-accent)]"
                  >
                    {s.label} ↗
                  </a>
                ))}
              </dd>
            </div>
          </dl>

          <div className="md:col-span-6 md:col-start-7">
            <ContactForm />
          </div>

        </div>
      </div>
    </section>
  );
}
