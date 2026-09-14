#!/usr/bin/env node
/**
 * check-content.mjs — the publication gate.
 *
 * The project archive was ingested from righteousgrp.com, a separately
 * registered company. The client has stated the work is MENAARC's, but until
 * that is confirmed in writing this refuses to let a production build ship it.
 *
 * To clear a project: set "status": "approved" in its content/projects/*.json.
 * To deploy a preview with everything still pending, set ALLOW_PENDING=1 —
 * which is a deliberate, visible act, not a default.
 *
 *   node scripts/check-content.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');
const ALLOW = process.env.ALLOW_PENDING === '1';

/** Facts the source pages never carried. Reported, but not blocking. */
const EXPECTED_FIELDS = ['client', 'year', 'area', 'scope', 'photographer'];

function load() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')));
}

const projects = load();
if (!projects.length) {
  console.log('content check: no projects found (run `npm run ingest`)');
  process.exit(0);
}

const pending = projects.filter((p) => p.status !== 'approved');
const noImages = projects.filter((p) => !p.images?.length);
const thin = projects.filter((p) => p.images?.length > 0 && p.images.length < 3);

const incomplete = projects
  .map((p) => ({
    slug: p.slug,
    missing: EXPECTED_FIELDS.filter((f) => {
      const v = p[f];
      return Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim();
    }),
  }))
  .filter((r) => r.missing.length);

console.log(`content check: ${projects.length} projects\n`);

if (noImages.length) {
  console.log(`  no usable images (${noImages.length}) — hidden from the site:`);
  for (const p of noImages) console.log(`    ${p.slug}`);
  console.log('');
}

if (thin.length) {
  console.log(`  thin galleries (${thin.length}) — ask the client for more photography:`);
  for (const p of thin) console.log(`    ${p.slug} (${p.images.length})`);
  console.log('');
}

if (incomplete.length) {
  console.log(`  missing facts the client still needs to supply (${incomplete.length}):`);
  for (const r of incomplete) console.log(`    ${r.slug.padEnd(34)} ${r.missing.join(', ')}`);
  console.log('');
}

if (!pending.length) {
  console.log('  all projects approved — cleared to publish.');
  process.exit(0);
}

console.log(`  awaiting client approval (${pending.length} of ${projects.length}):`);
for (const p of pending) console.log(`    ${p.slug}`);

if (ALLOW) {
  console.log('\n  ALLOW_PENDING=1 — building anyway. Preview only; do not point a');
  console.log('  public domain at this build.');
  process.exit(0);
}

console.error(`
  BUILD BLOCKED.

  These projects came from righteousgrp.com, a separately registered company,
  and have not been confirmed as MENAARC's work in writing.

  Either:
    - set "status": "approved" on the projects the client has cleared, or
    - run with ALLOW_PENDING=1 for an internal preview build.
`);
process.exit(1);
