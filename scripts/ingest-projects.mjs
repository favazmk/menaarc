#!/usr/bin/env node
/**
 * ingest-projects.mjs — pull the project archive into local content.
 *
 * Source: righteousgrp.com. These are a DIFFERENT registered company's
 * published project pages. The client has stated the work is theirs, but until
 * that is confirmed in writing every record is written with
 * status "pending-client-approval" and the production build refuses to ship it.
 * See scripts/check-content.mjs.
 *
 * Facts the source pages do not carry — client, location, year, area,
 * photographer — are emitted as empty strings for the client to fill in. They
 * are never inferred.
 *
 *   node scripts/ingest-projects.mjs            # fetch + write
 *   node scripts/ingest-projects.mjs --dry-run  # report only
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

import { extractImages } from './lib/extract-images.mjs';

const SITEMAP = 'https://righteousgrp.com/wp-sitemap-posts-projects-1.xml';
const CONTENT_DIR = 'content/projects';
const IMAGE_DIR = 'public/projects';
const UA = 'MENAARC-site-build/1.0 (content migration)';

/** Sector inferred from the brand, used only to seed the filter. Editable. */
const SECTOR_HINTS = [
  [/nando|rosa|sushi|wingstop|tortilla|marugame|peet|gdk|coffee|thai|udon/i, 'F&B'],
  [/bateel/i, 'F&B'],
  [/sacoor|reiss|paul|jack|vero|moda|shark/i, 'Retail'],
];

function slugFromUrl(url) {
  return url.replace(/\/$/, '').split('/').pop();
}

function titleCase(slug) {
  return slug
    .split('-')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

function guessSector(slug) {
  for (const [re, sector] of SECTOR_HINTS) if (re.test(slug)) return sector;
  return '';
}

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res;
}

async function listProjectUrls() {
  const xml = await (await get(SITEMAP)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/**
 * Source headings pack the venue into the name: "Reiss – Abu Dhabi",
 * "ROSA'S THAI , DUBAI HILLS MALL". Splitting on the separator recovers a real
 * location instead of leaving the field blank. This is parsing what the page
 * states, not inferring — anything the heading does not say stays empty.
 */
function splitHeading(raw) {
  const clean = raw
    .replace(/\s+/g, ' ')
    .replace(/\s+([,–—-])/g, '$1')
    .trim();

  const match = clean.match(/^(.*?)\s*[,–—]\s*(.+)$/);
  if (!match) return { title: clean, location: '' };
  return { title: match[1].trim(), location: match[2].trim() };
}

/** Source headings are often shouted. Title-case them unless they read as an
 *  acronym (GDK), which should stay upper. */
function normaliseCase(text) {
  if (!/[a-z]/.test(text) && text.replace(/[^A-Za-z]/g, '').length <= 4) return text;
  if (!/[a-z]/.test(text)) {
    return text
      .toLowerCase()
      .replace(/\b[a-z]/g, (c) => c.toUpperCase())
      // Both apostrophe forms appear in the source; the curly one is the common
      // case and a straight-quote-only rule leaves "Rosa'S Thai" behind.
      .replace(/(['’])S\b/g, '$1s');
  }
  return text;
}

async function scrape(url) {
  const html = await (await get(url)).text();
  const $ = cheerio.load(html);
  const slug = slugFromUrl(url);

  // Project pages have no <h1>; the name is the first <h2>, and the <title>
  // tag carries the same string suffixed with the source company's name.
  const heading =
    $('h2').first().text().trim() ||
    $('title').text().split('–')[0].trim() ||
    titleCase(slug);

  const { title, location } = splitHeading(heading);

  const paragraphs = $('p')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter((t) => t.length > 40 && !/cookie|privacy|©|all rights reserved|get a quote/i.test(t));

  // Project photos live in an Elementor gallery as <a href> targets, not <img>,
  // and everything that *is* an <img> is lazy-loaded behind an SVG placeholder.
  // extractImages handles both.
  const images = extractImages(html);

  return {
    slug,
    title: normaliseCase(title),
    location: normaliseCase(location),
    heading,
    sector: guessSector(slug),
    summary: paragraphs[0] ?? '',
    body: paragraphs.slice(1, 4),
    images,
    sourceUrl: url,
  };
}

async function downloadImages(slug, urls, dryRun) {
  const dir = path.join(IMAGE_DIR, slug);
  const written = [];
  const missing = [];

  for (const [i, url] of urls.entries()) {
    const ext = (url.split('.').pop() ?? 'webp').split('?')[0].toLowerCase();
    const name = `${String(i + 1).padStart(2, '0')}.${ext}`;
    const rel = `/projects/${slug}/${name}`;

    if (dryRun) {
      written.push(rel);
      continue;
    }

    await fs.mkdir(dir, { recursive: true });
    const target = path.join(dir, name);
    try {
      await fs.access(target);
      written.push(rel); // already have it
      continue;
    } catch {
      /* fetch below */
    }

    // The source site references images it no longer serves. One dead URL must
    // not abort the archive — record it and carry on.
    try {
      const res = await get(url);
      await fs.writeFile(target, Buffer.from(await res.arrayBuffer()));
      written.push(rel);
    } catch (err) {
      missing.push(`${url} (${err.message.split(' — ')[0]})`);
    }
  }

  return { written, missing };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const urls = await listProjectUrls();
  console.log(`found ${urls.length} project pages\n`);

  if (!dryRun) {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    await fs.mkdir(IMAGE_DIR, { recursive: true });
  }

  const index = [];

  for (const url of urls) {
    let project;
    try {
      project = await scrape(url);
    } catch (err) {
      console.warn(`  ! skipped ${url}: ${err.message}`);
      continue;
    }

    const { written: images, missing } = await downloadImages(
      project.slug,
      project.images,
      dryRun,
    );

    const record = {
      slug: project.slug,
      title: project.title,
      headingAtSource: project.heading,
      // Everything below is either verified-empty or client-supplied. Nothing
      // here is invented — blank means "the client still needs to tell us".
      client: '',
      location: project.location,
      sector: project.sector,
      year: '',
      area: '',
      scope: [],
      photographer: '',
      summary: project.summary,
      body: project.body,
      images,
      featured: false,
      status: 'pending-client-approval',
      source: { url: project.sourceUrl, ingestedAt: new Date().toISOString() },
    };

    if (!dryRun) {
      const file = path.join(CONTENT_DIR, `${project.slug}.json`);
      // Never clobber edits the client has already made.
      let existing = null;
      try {
        existing = JSON.parse(await fs.readFile(file, 'utf8'));
      } catch {
        /* new */
      }
      const merged = existing
        ? { ...record, ...existing, images: record.images, source: record.source }
        : record;
      await fs.writeFile(file, `${JSON.stringify(merged, null, 2)}\n`);
    }

    index.push({ slug: project.slug, title: project.title, images: images.length });
    const note = missing.length ? `  (${missing.length} unavailable at source)` : '';
    console.log(`  ${project.slug.padEnd(34)} ${images.length} image(s)${note}`);
    for (const m of missing) console.log(`      ! ${m}`);
  }

  console.log(`\n${dryRun ? 'would write' : 'wrote'} ${index.length} projects`);
  console.log('all marked status="pending-client-approval" — see scripts/check-content.mjs');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
