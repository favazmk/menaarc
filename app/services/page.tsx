import type { Metadata } from 'next';

import { Capabilities } from '@/components/sections/Capabilities';
import { Approach } from '@/components/sections/Approach';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Architectural design and project management for retail, hospitality and residential projects in Dubai and across the UAE.',
};

export default function ServicesPage() {
  return (
    <>
      <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
        <div className="u-shell pb-12 pt-40 md:pt-52">
          <p className="u-label">Services</p>
          <h1 className="u-display mt-6 max-w-[14ch]">
            Drawn here. Delivered here.
          </h1>
          <p className="u-lede mt-8">
            Design and project management, run by the same studio, on the same programme.
          </p>
        </div>
      </section>

      <Capabilities />
      <Approach />
      <ContactCta />
    </>
  );
}
