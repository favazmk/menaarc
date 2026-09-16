import { Reveal } from '@/components/ui/Reveal';
import { Illustration } from '@/components/ui/Illustration';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { process } from '@/lib/process';


export function Approach() {
  return (
    <section id="process" data-theme="dark" className="relative isolate scroll-mt-28 bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12">
          {/* Sticky on desktop so the heading holds while the steps pass it. */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <Reveal>
                <p className="u-label">Approach</p>
                <h2 className="u-headline mt-6 max-w-[12ch]">How a project actually runs.</h2>
              </Reveal>

              {/* Every layer the four stages coordinate — ceiling, services,
                  walls, floor — pulled apart so you can see they are one job. */}
              <Illustration
                src="/illustrations/fitout-axonometric.webp"
                width={1000}
                height={1250}
                delay={120}
                className="mt-12 hidden max-w-[20rem] md:block"
              />
            </div>
          </div>

          <ol className="md:col-span-8">
            {process.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 70}>
                <div
                  className="grid gap-6 border-t border-[var(--hairline)] py-10 md:grid-cols-12"
                  style={i === process.length - 1 ? { borderBottomWidth: 1 } : undefined}
                >
                  <span className="u-label md:col-span-2 text-[var(--color-accent)]">
                    {step.n}
                  </span>
                  <h3 className="u-title md:col-span-4">{step.title}</h3>
                  <p className="u-lede md:col-span-6">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          {/* Phones: the axonometric closes the section, after the steps,
              instead of sitting between the heading and step 01. */}
          <Illustration
            src="/illustrations/fitout-axonometric.webp"
            width={1000}
            height={1250}
            sizes="75vw"
            className="mx-auto w-3/4 max-w-[20rem] md:hidden"
          />
        </div>
      </div>
    </section>
  );
}
