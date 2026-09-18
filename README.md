# MENAARC

Marketing site for MENAARC Architectural Consultants, Dubai.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · GSAP ScrollTrigger · Lenis.

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

The film frames and project content are committed, so a fresh clone runs
immediately — you do not need to re-run the pipelines below.

---

## ⚠️ Before this site goes public

The 13 projects under `content/projects/` were ingested from
**righteousgrp.com**, a separately registered company (Righteous Group LLC).
Their site never mentions MENAARC. The client has stated the work is theirs.

**Get that confirmed in writing, and agree attribution wording, before launch.**

`npm run build` refuses to complete while any project is still
`"status": "pending-client-approval"`. To clear one, set `"status": "approved"`
in its JSON. To build a private preview with everything still pending:

```bash
ALLOW_PENDING=1 npm run build
```

That is deliberate and visible — do not point a public domain at such a build.

Run `npm run check:content` at any time for the current state, including which
facts the client still owes (client name, year, area, scope, photographer).

---

## The scroll film

The home page hero is a **canvas frame sequence**, not a scrubbed `<video>`.
`video.currentTime` seeking stutters badly on iOS Safari and low-end Android;
frames always paint.

**Both masters are placeholders** — 10-second clips generated on Gemini's free
tier, one landscape and one vertical, carrying the same narrative (villa
exterior → living volume → corridor → terrace → Burj Khalifa). The landscape
master is 720p and looks soft on a large display; a 4K version exists and can
replace it. No paid generation credits have been spent on this project.

### Replacing it

Drop a new master in `assets/masters/` and run:

```bash
npm run film
```

That regenerates both tiers and `public/film/manifest.json`. **No application
code changes.** If the new master has no watermark, drop `--delogo` from the
`film:*` scripts in `package.json`.

Each tier has its own master and its own `--delogo` box, set in the `film:*`
scripts. `ScrollFilm` reads each tier's aspect ratio from the manifest and picks
its layout from that — no flags to set. Swap in a landscape-only master and the
mobile tier falls back to the strip layout on its own.

### How it behaves

| Condition | Result |
|---|---|
| Desktop | 16:9 master, 240 frames @ 1280px, full-bleed, type centred |
| Narrow / low-memory / save-data | 9:16 master, 160 frames @ 720px, full-bleed, type anchored low |
| Landscape master in a portrait viewport | Cinematic strip, type stacked beneath — the fallback when no vertical master exists |
| `prefers-reduced-motion` | Static poster, no pin, all chapter copy as normal text |

Chapter copy and its scroll positions live in `content/film-chapters.json`.
Re-check the `from`/`to` ranges if you change the master.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (gated on content approval) |
| `npm run check:content` | Approval + completeness report |
| `npm run film` | Rebuild both frame tiers from the master |
| `npm run ingest` | Re-pull projects from the source site |
| `npm run optimize:images` | Cap and convert ingested photography to WebP |
| `node scripts/build-mena-map.mjs` | Regenerate `lib/mena-map.ts` — the region map's country geometry |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

`ingest` and `optimize:images` are one-off migration tools. Once the client
supplies their own photography they should not be run again — `ingest` would
overwrite the image lists.

`build-mena-map` needs the network and its output is committed, so it is not
part of the build. Re-run it only to change the map's window, its country list
or its pins.

---

## Structure

```
app/                      routes; fully static — enquiries go out over WhatsApp
components/
  brand/                  wordmark, JSON-LD
  film/                   the scroll film engine
  layout/                 header, footer, smooth scroll
  sections/               page sections
  ui/                     cursor, magnetic, reveal
content/                  project records + film chapter copy
lib/                      site constants, project loader, media-query hooks
scripts/                  build-time pipelines
assets/masters/           film source video (committed)
assets/projects-original/ untouched ingested photography (gitignored)
```

---

## Still outstanding

- Confirm the WhatsApp number in `lib/site.ts` is the one the studio answers,
  and send a test from the contact form.
- Client to confirm project rights and supply the missing project facts.
- `jack-jones-ibn-batuta-mall` has 1 usable image; 4 more are referenced by the
  source site but return 404 there.
- Decide whether a full Arabic `/ar` locale is in scope. The build ships
  bilingual brand treatment and Arabic-ready typography, not a translated site.

See `DEPLOY.md` for hosting.
