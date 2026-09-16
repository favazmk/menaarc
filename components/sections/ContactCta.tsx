import Link from 'next/link';

import { Reveal } from '@/components/ui/Reveal';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { Magnetic } from '@/components/ui/Magnetic';
import { site } from '@/lib/site';
import { isTrial } from '@/lib/trial';

/**
 * The closing invitation, worded for the page it closes.
 *
 * One block of copy repeated on three pages reads as a template the third
 * time you meet it, and it ignores what the visitor has just finished
 * reading — someone who has worked through the five services has a different
 * next question from someone who has just read about the founder. Same
 * component, same actions, different sentence.
 */
const PITCHES = {
  home: {
    label: 'Next project',
    heading: 'Tell us what you’re building.',
    lede: 'Send the brief, the site, or just the constraint you cannot get past. We will tell you honestly whether we are the right studio for it.',
    action: 'Start a conversation',
  },
  services: {
    label: 'Scope of work',
    heading: 'Which part do you need?',
    lede: 'Some clients want the whole run, from first sketch to handover. Others arrive holding drawings and need the approvals cleared. Tell us where the project already is and we will scope only what is left.',
    action: 'Scope a project',
  },
  studio: {
    label: 'Work with us',
    heading: 'Talk to the person who draws it.',
    lede: 'There is no account manager to get past. Bring a brief, a lease condition or an early idea — a first conversation costs nothing and usually tells both of us whether this is a fit.',
    action: 'Talk to the studio',
  },
  work: {
    label: 'Your project',
    heading: 'Yours would be next.',
    lede: 'Most of these started as a lease, a deadline and a plan that did not quite work yet. If that sounds familiar, send it over.',
    action: 'Start a conversation',
  },
} as const;

export type CtaVariant = keyof typeof PITCHES;

export function ContactCta({ variant = 'home' }: { variant?: CtaVariant }) {
  const pitch = PITCHES[variant];

  return (
    <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative py-32 md:py-48">
        <Reveal className="flex flex-col items-center text-center">
          <p className="u-label">{pitch.label}</p>
          <h2 className="u-display mt-8 max-w-[15ch]">{pitch.heading}</h2>
          <p className="u-lede mt-8 max-w-[46ch] text-center">{pitch.lede}</p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
            {/* The contact page is not published on a home-only build, so the
                primary action becomes the email it would have led to. */}
            <Magnetic strength={0.25}>
              {isTrial ? (
                <a
                  href={`mailto:${site.contact.email}`}
                  className="inline-block rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
                >
                  {pitch.action}
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="inline-block rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
                >
                  {pitch.action}
                </Link>
              )}
            </Magnetic>

            <Magnetic strength={0.25}>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-block rounded-full border border-[var(--hairline)] px-10 py-4 transition-colors hover:border-[var(--figure)]"
              >
                {site.contact.email}
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
