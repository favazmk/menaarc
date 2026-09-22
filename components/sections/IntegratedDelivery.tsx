import { Reveal } from '@/components/ui/Reveal';

export function IntegratedDelivery() {
  return (
    <section data-theme="dark" className="relative isolate overflow-hidden bg-[var(--ground)] text-[var(--figure)]">
      
      <div className="u-shell relative py-28 md:py-40">
        <Reveal>
          <p className="u-label">Integrated Delivery</p>
          <h2 className="u-display mt-6 max-w-[15ch]">
            Design with intent. Manage with certainty.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 border-t border-[var(--hairline)] pt-12 md:grid-cols-12 md:mt-24 md:pt-16">
          <Reveal delay={100} className="md:col-span-6 lg:col-span-5">
            <p className="u-lede max-w-[38ch]">
              MENAARC brings design and project management together from the first decision to final handover. We protect the design intent while coordinating programme, budget, approvals, consultants, contractors and site delivery.
            </p>
          </Reveal>

          <div className="grid gap-12 sm:grid-cols-2 md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7">
            <Reveal delay={200}>
              <div className="border-t border-[var(--hairline)] pt-6">
                <span className="u-label text-[var(--color-accent)]">01</span>
                <h3 className="u-title mt-4">Design Leadership</h3>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="border-t border-[var(--hairline)] pt-6">
                <span className="u-label text-[var(--color-accent)]">02</span>
                <h3 className="u-title mt-4">Project Accountability</h3>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
