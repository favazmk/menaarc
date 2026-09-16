import { Reveal } from '@/components/ui/Reveal';
import { DraftingGrid } from '@/components/ui/DraftingGrid';
import { Magnetic } from '@/components/ui/Magnetic';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { site } from '@/lib/site';
import { openers, whatsappHref } from '@/lib/whatsapp';

/**
 * The closing invitation, worded for the page it closes.
 *
 * One block of copy repeated on three pages reads as a template the third
 * time you meet it, and it ignores what the visitor has just finished
 * reading — someone who has worked through the five services has a different
 * next question from someone who has just read about the founder. Same
 * component, same actions, different sentence.
 *
 * The primary action opens WhatsApp with a first message already written for
 * that page (lib/whatsapp.ts), so a visitor goes from reading to talking in
 * one tap — and the studio's first read says where they came from.
 */
const PITCHES = {
  home: {
    whatsapp: openers.home as string,
    label: 'Next project',
    heading: 'Tell us what you’re building.',
    lede: 'Send the brief, the site, or just the constraint you cannot get past. We will tell you honestly whether we are the right studio for it.',
    action: 'Start a conversation',
  },
  services: {
    whatsapp: openers.services as string,
    label: 'Scope of work',
    heading: 'Which part do you need?',
    lede: 'Some clients want the whole run, from first sketch to handover. Others arrive holding drawings and need the approvals cleared. Tell us where the project already is and we will scope only what is left.',
    action: 'Scope a project',
  },
  studio: {
    whatsapp: openers.studio as string,
    label: 'Work with us',
    heading: 'Talk to the person who draws it.',
    lede: 'There is no account manager to get past. Bring a brief, a lease condition or an early idea — a first conversation costs nothing and usually tells both of us whether this is a fit.',
    action: 'Talk to the studio',
  },
  work: {
    whatsapp: openers.work as string,
    label: 'Your project',
    heading: 'Yours would be next.',
    lede: 'Most of these started as a lease, a deadline and a plan that did not quite work yet. If that sounds familiar, send it over.',
    action: 'Start a conversation',
  },
  // A case study: the message names the project, passed in by the page.
  project: {
    whatsapp: openers.home as string,
    label: 'Something like this',
    heading: 'Have one like it?',
    lede: 'Most briefs we get start with "something like that one, but for our unit". Send us yours and we will tell you what would carry across and what would not.',
    action: 'Start a conversation',
  },
} as const;

export type CtaVariant = keyof typeof PITCHES;

export function ContactCta({
  variant = 'home',
  message,
}: {
  variant?: CtaVariant;
  /** Overrides the page's default opener — a case study passes its own title. */
  message?: string;
}) {
  const pitch = PITCHES[variant];
  const href = whatsappHref(message ?? pitch.whatsapp);

  return (
    <section data-theme="light" className="relative isolate bg-[var(--ground)] text-[var(--figure)]">
      <DraftingGrid />
      <div className="u-shell relative py-32 md:py-48">
        <Reveal className="flex flex-col items-center text-center">
          <p className="u-label">{pitch.label}</p>
          <h2 className="u-display mt-8 max-w-[15ch]">{pitch.heading}</h2>
          <p className="u-lede mt-8 max-w-[46ch] text-center">{pitch.lede}</p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
            {/* WhatsApp works the same on a home-only trial build as on the full
                site, so there is no longer a branch for the unpublished
                contact page. */}
            <Magnetic strength={0.25}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-3 rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
              >
                <WhatsAppIcon />
                {pitch.action}
              </a>
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
