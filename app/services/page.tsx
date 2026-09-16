import type { Metadata } from 'next';

import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { ParallaxBand } from '@/components/ui/ParallaxBand';
import { Capabilities } from '@/components/sections/Capabilities';
import { Approach } from '@/components/sections/Approach';
import { ContactCta } from '@/components/sections/ContactCta';
import { getBandImage, getProject } from '@/lib/projects';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Concept creation, detailed drawing, authority approvals, MEP drawing and project management for retail, F&B, hospitality and residential projects in Dubai and across the UAE.',
};

export default function ServicesPage() {
  const band = getProject('sacoor-brothers-deira-city');

  return (
    <>
      <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
        <DraftingGrid plan="restaurant" />
        <div className="u-shell relative pb-12 pt-40 md:pt-52">
          <p className="u-label">Services</p>
          <h1 className="u-display mt-6 max-w-[14ch]">
            Drawn here. Approved here. Delivered here.
          </h1>
          <p className="u-lede mt-8">
            Concept creation, detailed drawing, authority approvals, MEP drawing and project
            management — run by the same studio, on the same programme.
          </p>
        </div>
      </section>

      <Capabilities />

      {band ? (
        <ParallaxBand
          src={getBandImage(band)}
          alt={`${band.title}${band.location ? `, ${band.location}` : ''} — by ${site.name}`}
          caption={[band.title, band.location].filter(Boolean).join(' · ')}
        />
      ) : null}

      <Approach />
      <ContactCta variant="services" />
    </>
  );
}
