import { Reveal } from '@/components/ui/Reveal';
import { services } from '@/lib/services';

/**
 * The service list: three services, each with its scope, laid out in full.
 *
 * Wording and structure follow the client's own brief — a numbered title, a
 * line naming what it covers, a description and the scope beneath it.
 */
export function Capabilities() {
  return (
    <section data-theme="light" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal className="md:sticky md:top-32">
              <p className="u-label">An integrated approach</p>
              <h2 className="u-headline mt-6">
                Bringing design, technical expertise and project delivery together under one
                practice.
              </h2>
            </Reveal>
          </div>

          <ol className="md:col-span-8">
            {services.map((service, i) => (
              <Reveal as="li" key={service.id} delay={i * 70}>
                <div
                  id={service.id}
                  className="scroll-mt-28 border-t border-[var(--hairline)] py-10"
                  style={i === services.length - 1 ? { borderBottomWidth: 1 } : undefined}
                >
                  <h3 className="u-title">
                    <span className="text-[var(--color-accent)]">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[var(--muted)]"> / </span>
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] text-[var(--muted)]">{service.sub}</p>
                  <p className="mt-5 max-w-[var(--measure)] text-[1.0625rem] leading-relaxed">
                    {service.lede}
                  </p>
                  <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
                    <span className="u-label mr-3">Scope</span>
                    {service.items.join(' · ')}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
