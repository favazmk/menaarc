import { Reveal } from '@/components/ui/Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Brief',
    body: 'What the space has to do, who uses it, what it can cost, and when it has to open. We would rather argue about this now than on site.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'Concept, then development, then a drawing set. Each stage signed off before the next begins, so nothing gets redrawn twice.',
  },
  {
    n: '03',
    title: 'Approvals',
    body: 'Authority submissions, NOCs, landlord and mall conditions. The part that quietly decides whether a programme holds.',
  },
  {
    n: '04',
    title: 'Delivery',
    body: 'Tender, award, supervision, snagging, handover. One point of accountability from the first sketch to the day it opens.',
  },
];

export function Approach() {
  return (
    <section data-theme="dark" className="bg-[var(--ground)] text-[var(--figure)]">
      <div className="u-shell py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12">
          {/* Sticky on desktop so the heading holds while the steps pass it. */}
          <div className="md:col-span-4">
            <Reveal className="md:sticky md:top-32">
              <p className="u-label">Approach</p>
              <h2 className="u-headline mt-6 max-w-[12ch]">How a project actually runs.</h2>
            </Reveal>
          </div>

          <ol className="md:col-span-8">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 70}>
                <div
                  className="grid gap-6 border-t border-[var(--hairline)] py-10 md:grid-cols-12"
                  style={i === STEPS.length - 1 ? { borderBottomWidth: 1 } : undefined}
                >
                  <span className="u-label md:col-span-2 text-[var(--color-accent)]">
                    {step.n}
                  </span>
                  <h3 className="u-title md:col-span-3">{step.title}</h3>
                  <p className="u-lede md:col-span-7">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
