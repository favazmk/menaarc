import { Reveal } from '@/components/ui/Reveal';
import { Illustration } from '@/components/ui/Illustration';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { delivery, design, processIntro, type Phase } from '@/lib/process';

/** "01 / Design consultancy ........ 5 weeks", then the phase's one-line intro. */
function PhaseHead({ phase }: { phase: Phase }) {
  return (
    <Reveal>
      <div className="flex items-baseline justify-between gap-6 border-t border-[var(--hairline)] pt-6">
        <h3 className="u-title">
          <span className="text-[var(--color-accent)]">{phase.n}</span>
          <span className="text-[var(--muted)]"> / </span>
          {phase.title}
        </h3>
        <span className="u-label shrink-0">{phase.term}</span>
      </div>
      <p className="u-lede mt-4">{phase.intro}</p>
    </Reveal>
  );
}

export function Approach() {
  return (
    <section id="process" data-theme="dark" className="relative isolate scroll-mt-28 bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12">
          {/* Sticky on desktop so the heading holds while the stages pass it. */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <Reveal>
                <p className="u-label">Our process</p>
                <h2 className="u-headline mt-6 max-w-[12ch]">{processIntro.headline}</h2>
                <p className="u-lede mt-6">{processIntro.lede}</p>
              </Reveal>

              {/* Every layer the stages coordinate — ceiling, services,
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

          <div className="md:col-span-8">
            <PhaseHead phase={design} />
            <ol className="mt-10">
              {design.stages.map((stage, i) => (
                <Reveal as="li" key={stage.n} delay={i * 70}>
                  <div
                    className="grid gap-4 border-t border-[var(--hairline)] py-10 md:grid-cols-12 md:gap-6"
                    style={i === design.stages.length - 1 ? { borderBottomWidth: 1 } : undefined}
                  >
                    <span className="u-label md:col-span-2 text-[var(--color-accent)]">{stage.n}</span>
                    <div className="md:col-span-4">
                      <h4 className="u-title">{stage.title}</h4>
                      <p className="u-label mt-3">{stage.when}</p>
                    </div>
                    <div className="md:col-span-6">
                      <p className="u-lede">{stage.body}</p>
                      <p className="mt-4 text-sm">
                        <span className="u-label mr-2">Deliverable</span>
                        {stage.deliverable}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>

            <div className="mt-24">
              <PhaseHead phase={delivery} />
              <ol className="mt-10 grid gap-px border-t border-[var(--hairline)] md:grid-cols-3 md:border-t-0">
                {delivery.stages.map((stage, i) => (
                  <Reveal
                    as="li"
                    key={stage.n}
                    delay={i * 70}
                    className="border-b border-[var(--hairline)] py-8 md:border-b-0 md:border-t md:pr-8"
                  >
                    <span className="u-label text-[var(--color-accent)]">{stage.n}</span>
                    <h4 className="u-title mt-5">{stage.title}</h4>
                    <p className="u-lede mt-3">{stage.body}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>

          {/* Phones: the axonometric closes the section, after the stages,
              instead of sitting between the heading and stage 01. */}
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
