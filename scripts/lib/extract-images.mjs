/**
 * Pull real image URLs out of a WordPress/Elementor page.
 *
 * Two traps on the source site:
 *  - Images lazy-load, so `src` holds an inline SVG placeholder and the real
 *    URL sits in `data-lazy-src` / `data-lazy-srcset`.
 *  - Project photos are an Elementor *gallery*, so they appear as `<a href>`
 *    targets and CSS background URLs, not as `<img>` at all.
 *
 * Scanning the whole document for upload URLs catches every case; the chrome
 * filter below is what keeps it from dragging in the logo and favicon.
 */

const UPLOAD_URL =
  /https?:\/\/[^\s"'<>()\\]+\/wp-content\/uploads\/[^\s"'<>()\\]+?\.(?:jpe?g|png|webp|avif)/gi;

/** Site furniture that appears on every page and is never project work. */
const CHROME = /logo|favicon|icon|avatar|placeholder|sprite|pattern|bg-\d|convert\.io/i;

const SIZE_SUFFIX = /-\d+x\d+(?=\.(?:jpe?g|png|webp|avif)$)/i;

/** Strip WordPress's `-1024x768` suffix so we fetch the original upload. */
export function fullSize(url) {
  return url.split('?')[0].replace(SIZE_SUFFIX, '');
}

/**
 * WordPress publishes both the original upload and a '-scaled' render capped at
 * 2560px. Both URLs appear in the markup and are the same photograph, so keep
 * one per image — preferring '-scaled', which is the largest render the site
 * actually serves.
 */
function dedupeVariants(urls) {
  const byImage = new Map();
  for (const url of urls) {
    const key = url.replace(/-scaled(?=\.[a-z]+$)/i, '');
    const existing = byImage.get(key);
    if (!existing || /-scaled\.[a-z]+$/i.test(url)) byImage.set(key, url);
  }
  return [...byImage.values()];
}

export function extractImages(html) {
  const found = new Set();

  for (const raw of html.match(UPLOAD_URL) ?? []) {
    // Entity-encoded URLs show up inside Elementor's JSON settings blobs.
    const url = raw.replace(/&amp;/g, '&').replace(/\\\//g, '/');
    if (CHROME.test(url)) continue;
    found.add(fullSize(url));
  }

  return dedupeVariants([...found]);
}
