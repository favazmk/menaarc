import { NextResponse } from 'next/server';

import { site } from '@/lib/site';

/**
 * The single server-dependent file in the project.
 *
 * Right now it validates and logs. Wire it to a real transport before launch —
 * Resend, or the client's own SMTP. If the site later moves to Hostinger static
 * hosting, this route disappears and the form's action points at a hosted form
 * endpoint instead; nothing else changes. See DEPLOY.md.
 */

export const runtime = 'nodejs';

type Payload = {
  name?: string;
  email?: string;
  sector?: string;
  services?: string[] | string;
  message?: string;
  company_website?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: Payload) {
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || name.length > 120) return { error: 'Please give us a name' };
  if (!EMAIL.test(email)) return { error: 'That email address does not look right' };
  if (message.length < 10) return { error: 'Tell us a little more' };
  if (message.length > 5000) return { error: 'That message is too long to send' };

  // A native (no-JS) submit sends repeated fields, which arrive here as a
  // single value rather than an array — normalise both shapes.
  const raw = body.services;
  const services = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map((s) => String(s).trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 8);

  return {
    value: {
      name,
      email,
      message,
      sector: String(body.sector ?? '').trim().slice(0, 40),
      services,
    },
  };
}

export async function POST(request: Request) {
  let body: Payload;

  // The form also submits natively when JS is off, which arrives as form-encoded.
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      body = (await request.json()) as Payload;
    } else {
      const fd = await request.formData();
      body = { ...Object.fromEntries(fd), services: fd.getAll('services').map(String) } as Payload;
    }
  } catch {
    return NextResponse.json({ error: 'Could not read that submission' }, { status: 400 });
  }

  // Honeypot: silently accept so a bot does not learn it was caught.
  if (String(body.company_website ?? '').trim()) {
    return NextResponse.json({ ok: true });
  }

  const result = validate(body);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // TODO(launch): replace with a real transport. Until then the enquiry is only
  // in the server log — do not point a public domain at this build without it.
  console.info('[contact] enquiry for %s:', site.contact.email, {
    ...result.value,
    receivedAt: new Date().toISOString(),
  });

  if (!type.includes('application/json')) {
    return NextResponse.redirect(new URL('/contact?sent=1', request.url), 303);
  }

  return NextResponse.json({ ok: true });
}
