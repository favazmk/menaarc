#!/usr/bin/env node
/**
 * optimize-images.mjs — normalise ingested project photography for the web.
 *
 * The source archive is 36MB of mixed PNG/JPEG/WebP straight off phones and
 * WordPress, some of it 2560px wide. This caps the long edge, converts
 * everything to WebP, and rewrites the paths in content/projects/*.json.
 *
 * Deliberately format-uniform rather than clever: next/image handles responsive
 * sizing on Vercel, and a single pre-optimised WebP per photo is also what a
 * later static export on shared hosting needs. Originals are preserved under
 * assets/projects-original/ so this is never destructive.
 *
 *   node scripts/optimize-images.mjs
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const run = promisify(execFile);

const IMAGE_DIR = 'public/projects';
const CONTENT_DIR = 'content/projects';
const ARCHIVE_DIR = 'assets/projects-original';
const MAX_EDGE = 1800;
const QUALITY = 78;

async function optimizeOne(srcAbs, outAbs) {
  // `scale` with force_original_aspect_ratio=decrease only shrinks, so a photo
  // already under the cap passes through at its native size rather than being
  // blown up.
  await run('ffmpeg', [
    '-y', '-v', 'error',
    '-i', srcAbs,
    '-vf', `scale='min(${MAX_EDGE},iw)':'min(${MAX_EDGE},ih)':force_original_aspect_ratio=decrease:flags=lanczos`,
    '-c:v', 'libwebp', '-quality', String(QUALITY), '-compression_level', '5',
    '-frames:v', '1',
    outAbs,
  ], { maxBuffer: 1 << 26 });
}

async function main() {
  const slugs = await fs.readdir(IMAGE_DIR).catch(() => []);
  if (!slugs.length) {
    console.log('nothing to optimize — run `npm run ingest` first');
    return;
  }

  let before = 0;
  let after = 0;
  const jobs = [];

  for (const slug of slugs) {
    const dir = path.join(IMAGE_DIR, slug);
    if (!(await fs.stat(dir)).isDirectory()) continue;

    for (const file of await fs.readdir(dir)) {
      if (file.endsWith('.opt.webp')) continue;
      jobs.push({ slug, dir, file });
    }
  }

  const workers = Math.max(2, Math.min(os.cpus().length - 1, 8));
  let cursor = 0;
  const rewrites = new Map();

  const worker = async () => {
    while (cursor < jobs.length) {
      const { slug, dir, file } = jobs[cursor];
      cursor += 1;

      const srcAbs = path.join(dir, file);
      const stem = file.replace(/\.[^.]+$/, '');
      const outRel = `/projects/${slug}/${stem}.webp`;
      const outAbs = path.join(dir, `${stem}.opt.webp`);

      const srcSize = (await fs.stat(srcAbs)).size;
      before += srcSize;

      try {
        await optimizeOne(srcAbs, outAbs);
      } catch (err) {
        console.warn(`  ! ${slug}/${file}: ${String(err.stderr || err.message).trim().slice(0, 120)}`);
        continue;
      }

      // Keep the untouched original outside public/ so it never ships but is
      // always recoverable.
      const archiveDir = path.join(ARCHIVE_DIR, slug);
      await fs.mkdir(archiveDir, { recursive: true });
      await fs.rename(srcAbs, path.join(archiveDir, file));
      await fs.rename(outAbs, path.join(dir, `${stem}.webp`));

      after += (await fs.stat(path.join(dir, `${stem}.webp`))).size;
      rewrites.set(`/projects/${slug}/${file}`, outRel);
    }
  };

  await Promise.all(Array.from({ length: workers }, worker));

  // Point the content records at the optimised files.
  for (const file of await fs.readdir(CONTENT_DIR)) {
    const full = path.join(CONTENT_DIR, file);
    const record = JSON.parse(await fs.readFile(full, 'utf8'));
    record.images = record.images.map((p) => rewrites.get(p) ?? p);
    await fs.writeFile(full, `${JSON.stringify(record, null, 2)}\n`);
  }

  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;
  console.log(`optimised ${rewrites.size} images: ${mb(before)} -> ${mb(after)}`);
  console.log(`originals archived in ${ARCHIVE_DIR}/ (not shipped)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
