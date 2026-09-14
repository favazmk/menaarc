# Deployment

Vercel now, Hostinger later. The build is kept portable so that move is a
config change rather than a rewrite.

---

## Now — Vercel

```bash
npm i -g vercel      # if not installed
vercel login
vercel link
vercel               # preview
vercel --prod        # production
```

### Environment

| Variable | Value | Why |
|---|---|---|
| `ALLOW_PENDING` | `1` | **Preview only.** Lets the build run while project content is still awaiting client approval. Remove it before any public launch. |

Set it in the Vercel dashboard under Settings → Environment Variables, scoped
to Preview only — never Production. That way a production deploy fails loudly
if the content has not been cleared, which is the intended behaviour.

### Domain

`menaarc.com` is registered at Namecheap and currently serves a parked cPanel
page. To point it at Vercel:

1. Vercel → Project → Settings → Domains → add `menaarc.com` and `www.menaarc.com`.
2. Namecheap → Domain List → Manage → Advanced DNS.
3. Replace the parking records with what Vercel shows — typically an `A` record
   for `@` and a `CNAME` for `www` → `cname.vercel-dns.com`.
4. Leave the Namecheap hosting account alone; it is no longer serving the site.

Propagation is usually minutes, occasionally a few hours.

---

## Later — Hostinger

The existing Hostinger account (`u785953539`) currently holds only
`docmate.ae` on a Node.js plan. Two routes:

### Route A — Node.js (keeps everything working)

Deploy as a Node application, same as `docmate.ae`. Nothing in the codebase
changes; `app/api/contact/route.ts` keeps working.

### Route B — static export (cheapest, one thing to fix)

```js
// next.config.ts
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
```

```bash
npm run build        # emits ./out
```

Upload `out/` to `public_html`. Then the **one** thing that breaks:

- `app/api/contact/route.ts` cannot run. Delete it and point the form at a
  hosted endpoint instead — change the `fetch` URL and the `<form action>` in
  `components/sections/ContactForm.tsx`. Both are single-line changes; the
  markup, validation and honeypot stay as they are.

Everything else is already static-safe: no server actions, no ISR, no
Vercel-specific image loader, all media pre-optimised at build time.

### Media on shared hosting

The film is ~4.5MB of AVIF (desktop tier) plus project photography. Shared
hosting has no CDN, so first paint from outside the region will be slower than
Vercel. If that shows, move `public/film/` and `public/projects/` to Cloudflare
R2 or Bunny and prefix the manifest `pattern` values with the CDN origin —
`build-film.mjs` writes those paths, so it is a one-line change there.

---

## Pre-launch checklist

- [ ] Client has confirmed project rights **in writing**; attribution agreed
- [ ] Every project set to `"status": "approved"` (or the unapproved ones removed)
- [ ] `ALLOW_PENDING` removed from the Production environment
- [ ] `npm run build` passes with no override
- [ ] Contact route wired to a real transport and a test enquiry received
- [ ] `lib/site.ts` checked — phone, email, social links
- [ ] Missing project facts filled in, or the fact tables left short rather than blank
- [ ] DNS cut over and HTTPS issued
