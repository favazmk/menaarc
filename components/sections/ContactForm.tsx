'use client';

import { useState } from 'react';

import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { services, sectors } from '@/lib/services';
import { site } from '@/lib/site';
import { whatsappHref } from '@/lib/whatsapp';

/**
 * A field that looks like a field.
 *
 * These used to be a bottom hairline on a transparent ground — the editorial
 * underline input. Once the page gained its drawing grid, that hairline was one
 * line among dozens of identical ones, and the fields stopped reading as places
 * you could type. A bordered box on the section's own ground both says "input"
 * and masks the grid behind it, and the focus ring in the accent colour marks
 * the one that is active.
 */
const FIELD =
  'mt-3 block w-full rounded-2xl border border-[color-mix(in_srgb,var(--figure)_22%,transparent)] bg-[var(--ground)] px-5 py-4 text-[1.0625rem] text-[var(--figure)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[color-mix(in_srgb,var(--muted)_75%,transparent)] hover:border-[color-mix(in_srgb,var(--figure)_45%,transparent)] focus:border-[var(--figure)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]';

const SECTOR_OPTIONS = [...sectors, 'Other'];

const CHIP =
  'cursor-pointer rounded-full border border-[color-mix(in_srgb,var(--figure)_22%,transparent)] bg-[var(--ground)] px-5 py-2.5 transition-colors hover:border-[var(--figure)] has-[:checked]:border-[var(--figure)] has-[:checked]:bg-[var(--figure)] has-[:checked]:text-[var(--ground)] has-[:focus-visible]:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]';

/**
 * Turns the filled-in form into the first WhatsApp message the studio reads.
 *
 * `fd` is the form's FormData. Fields available:
 *   fd.get('name')          — always present (required)
 *   fd.get('email')         — may be an empty string (optional)
 *   fd.get('sector')        — null if no project type was picked
 *   fd.getAll('services')   — string[], possibly empty
 *   fd.get('text')          — the brief, always present (required)
 */
function composeMessage(fd: FormData): string {
  const field = (key: string) => String(fd.get(key) ?? '').trim();

  const name = field('name');
  const email = field('email');
  const sector = field('sector');
  const brief = field('text');
  const needs = fd.getAll('services').map((s) => lowerTitle(String(s)));

  // Written as sentences rather than "Label: value" lines: this is the first
  // message the studio reads from a person, and a filled-in form pasted into a
  // chat reads like a ticket. Every sentence is only built from fields that
  // were actually given, so nothing reads "a  project" or "help with ." when
  // a chip was left unpicked.
  const sentences = [`Hi MENAARC, my name is ${name}.`];

  const project = sector && sector !== 'Other' ? `${article(sector)} ${sectorWord(sector)} project` : 'a project';
  if (needs.length) {
    sentences.push(`I'm planning ${project} and need help with ${listOf(needs)}.`);
  } else if (sector) {
    sentences.push(`I'm planning ${project}.`);
  }

  if (email) sentences.push(`You can also reach me by email at ${email}.`);

  // The brief goes last and on its own paragraph: it is the longest part, and
  // the one the studio will read twice.
  return `${sentences.join(' ')}\n\n${brief}`;
}

/** "Authority Approvals" → "authority approvals"; acronyms such as MEP stay as written. */
function lowerTitle(title: string) {
  return title
    .split(' ')
    .map((word) => (word === word.toUpperCase() ? word : word.toLowerCase()))
    .join(' ');
}

/** Sectors read as adjectives mid-sentence: "a retail project", "an F&B project". */
function sectorWord(sector: string) {
  return sector === sector.toUpperCase() ? sector : sector.toLowerCase();
}

/**
 * The article goes by sound, not spelling: F&B is said "eff and bee", so it
 * takes "an" even though F is a consonant. Only initialisms need that care —
 * every other sector is an ordinary word.
 */
function article(sector: string) {
  const spokenVowel = sector === sector.toUpperCase() ? /^[AEFHILMNORSX]/ : /^[aeiou]/i;
  return spokenVowel.test(sector) ? 'an' : 'a';
}

/** "a", "a and b", "a, b and c" — no serial comma, matching the site's own copy. */
function listOf(items: string[]) {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * The enquiry form, delivered over WhatsApp.
 *
 * It used to post to /api/contact, which validated and logged but was never
 * wired to a mail transport — so enquiries went nowhere. WhatsApp needs no
 * server at all: the form writes the message and opens a chat with the studio;
 * the visitor presses send in WhatsApp. That also leaves the site fully static.
 *
 * Without JavaScript the form still works: it submits as a GET to wa.me, and
 * the brief's field is named `text`, which is the parameter wa.me prefills
 * from. The other fields ride along as parameters WhatsApp ignores.
 */
export function ContactForm() {
  const [opened, setOpened] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = whatsappHref(composeMessage(new FormData(event.currentTarget)));
    setOpened(href);

    // A new tab keeps the form filled in behind it, in case they want to edit
    // and send again. If a popup blocker refuses the tab, go there directly.
    const tab = window.open(href, '_blank');
    if (tab) tab.opener = null;
    else window.location.href = href;
  }

  return (
    <form
      action={`https://wa.me/${site.contact.whatsapp}`}
      method="get"
      target="_blank"
      onSubmit={onSubmit}
      className="space-y-10"
    >
      <div>
        <label htmlFor="name" className="u-label">
          Your name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your full name"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="email" className="u-label">
          Email <span className="normal-case tracking-normal opacity-70">— optional</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com, if you'd like drawings sent there"
          className={FIELD}
        />
      </div>

      <fieldset>
        <legend className="u-label">Project type</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {SECTOR_OPTIONS.map((sector) => (
            <label key={sector} className={CHIP}>
              <input type="radio" name="sector" value={sector} className="sr-only" />
              <span className="u-label text-current">{sector}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="u-label">What do you need?</legend>
        {/* Checkboxes, not radios: enquiries routinely span concept, drawings
            and approvals at once. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {services.map((service) => (
            <label key={service.id} className={CHIP}>
              <input type="checkbox" name="services" value={service.title} className="sr-only" />
              <span className="u-label text-current">{service.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="brief" className="u-label">
          The brief, or the problem
        </label>
        <textarea
          id="brief"
          // `text` is what wa.me prefills from, which is what makes the
          // no-JavaScript submission still arrive with the brief in it.
          name="text"
          required
          rows={6}
          placeholder="The unit, the mall, the opening date — or the one thing that isn't working yet."
          className={`${FIELD} resize-y leading-relaxed`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="submit"
          className="inline-flex items-center gap-3 rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
        >
          <WhatsAppIcon />
          Continue on WhatsApp
        </button>
        <p className="max-w-[34ch] text-sm leading-snug text-[var(--muted)]">
          Opens WhatsApp with your message written out. Nothing is sent until you press send there.
        </p>
      </div>

      {opened ? (
        <p role="status" aria-live="polite" className="text-[var(--muted)]">
          WhatsApp should have opened with your message ready.{' '}
          <a href={opened} target="_blank" rel="noreferrer noopener" className="text-[var(--figure)] underline underline-offset-4">
            Didn&rsquo;t open? Try again
          </a>
          , or call {site.contact.phone}.
        </p>
      ) : null}
    </form>
  );
}
