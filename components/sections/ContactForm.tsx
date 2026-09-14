'use client';

import { useState } from 'react';

import { site } from '@/lib/site';

type State = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
  'w-full border-0 border-b border-[var(--hairline)] bg-transparent pb-3 pt-2 text-[var(--figure)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--figure)]';

const SECTORS = ['Retail', 'F&B', 'Hospitality', 'Residential', 'Other'];

/**
 * The one non-static surface on the site. It posts to /api/contact, which is
 * the single file that has to change if the site later moves to Hostinger
 * static hosting — see DEPLOY.md.
 *
 * Progressive by design: with JS disabled the form still submits natively to
 * the same endpoint.
 */
export function ContactForm() {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string>('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setError('');

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Send failed');
      setState('sent');
      form.reset();
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (state === 'sent') {
    return (
      <div
        role="status"
        className="border-t border-[var(--hairline)] pt-10"
        aria-live="polite"
      >
        <p className="u-title">Thank you — that&rsquo;s with us.</p>
        <p className="u-lede mt-4">
          We read everything ourselves and reply within two working days. If it&rsquo;s urgent,
          call {site.contact.phone}.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="u-label mt-8 underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form action="/api/contact" method="post" onSubmit={onSubmit} className="space-y-10">
      <div>
        <label htmlFor="name" className="u-label">
          Your name
        </label>
        <input id="name" name="name" required autoComplete="name" className={FIELD} />
      </div>

      <div>
        <label htmlFor="email" className="u-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD}
        />
      </div>

      <fieldset>
        <legend className="u-label">Project type</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {SECTORS.map((sector) => (
            <label
              key={sector}
              className="cursor-pointer rounded-full border border-[var(--hairline)] px-5 py-2.5 transition-colors has-[:checked]:border-[var(--figure)] has-[:checked]:bg-[var(--figure)] has-[:checked]:text-[var(--ground)]"
            >
              <input type="radio" name="sector" value={sector} className="sr-only" />
              <span className="u-label text-current">{sector}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="u-label">
          The brief, or the problem
        </label>
        <textarea id="message" name="message" required rows={5} className={`${FIELD} resize-y`} />
      </div>

      {/* Honeypot. Real people never fill this in; bots usually do. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="company-website">Leave this empty</label>
        <input id="company-website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      {state === 'error' ? (
        <p role="alert" className="text-[var(--color-accent)]">
          {error}. You can also email{' '}
          <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
            {site.contact.email}
          </a>
          .
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="rounded-full bg-[var(--figure)] px-10 py-4 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] disabled:opacity-50"
      >
        {state === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
