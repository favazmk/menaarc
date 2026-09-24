import { Reveal } from '@/components/ui/Reveal';
import { Wordmark } from '@/components/brand/Wordmark';

/**
 * Who this is, in as few words as it can be said: the mark in both scripts and
 * the two things the studio does. Everything longer lives further down.
 */
export function IntegratedDelivery() {
  return (
    <section data-theme="dark" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell flex flex-col items-center py-28 text-center md:py-40">
        <Reveal>
          <h2>
            <Wordmark size="xl" withArabic />
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-12 text-[clamp(0.8rem,1.6vw,1.125rem)] font-medium uppercase tracking-[0.32em] text-[var(--muted)] md:mt-16">
            Design <span className="text-[var(--color-accent)]">&amp;</span> Project Management
          </p>
        </Reveal>
      </div>
    </section>
  );
}
