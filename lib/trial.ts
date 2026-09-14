/**
 * Home-page-only build, for hosting a single static page on its own.
 *
 * When set, every link that would navigate to another route is removed rather
 * than left to 404 — the nav, the footer site list, the project cards and the
 * contact CTA. Links that resolve fine without the rest of the site (mailto,
 * tel, the social profiles) stay.
 *
 * Enabled by `NEXT_PUBLIC_TRIAL=1`, which `npm run build:trial` sets. It is a
 * NEXT_PUBLIC_ var because the components reading it render on the client too.
 */
export const isTrial = process.env.NEXT_PUBLIC_TRIAL === '1';
