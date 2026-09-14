#!/usr/bin/env node
/**
 * build-film.mjs — master video -> tiered frame sequence + manifest.
 *
 * The scroll film is rendered as a canvas frame sequence rather than a scrubbed
 * <video>, because `video.currentTime` seeking stutters badly on iOS Safari and
 * low-end Android. Frames always paint.
 *
 * Re-run this against a new master and nothing in the app changes — the runtime
 * reads public/film/manifest.json.
 *
 *   node scripts/build-film.mjs --in assets/masters/villa.mp4 --tier desktop \
 *        --frames 240 --width 1280
 *   node scripts/build-film.mjs --in assets/masters/villa.mp4 --tier mobile \
 *        --frames 160 --width 828 --crop 9:16
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const run = promisify(execFile);
const OUT_ROOT = 'public/film';
const MANIFEST = path.join(OUT_ROOT, 'manifest.json');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

async function probe(input) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-print_format', 'json',
    '-show_entries', 'stream=width,height,nb_frames,r_frame_rate,duration',
    '-select_streams', 'v:0',
    input,
  ]);
  const s = JSON.parse(stdout).streams[0];
  const [num, den] = String(s.r_frame_rate).split('/').map(Number);
  const fps = den ? num / den : num;
  const duration = Number(s.duration) || 0;
  return {
    width: s.width,
    height: s.height,
    fps,
    duration,
    frames: Number(s.nb_frames) || Math.round(duration * fps),
  };
}

/** Largest crop rectangle of the given aspect that fits inside the source, centred. */
function cropBox(src, crop) {
  const [cw, ch] = crop.split(':').map(Number);
  const srcAspect = src.width / src.height;
  const cropAspect = cw / ch;
  let w;
  let h;
  if (cropAspect < srcAspect) {
    h = src.height;
    w = Math.round(src.height * cropAspect);
  } else {
    w = src.width;
    h = Math.round(src.width / cropAspect);
  }
  return { w: w - (w % 2), h: h - (h % 2) };
}

async function encodeTier({ input, tier, targetFrames, targetWidth, crop, delogo, src }) {
  const dir = path.join(OUT_ROOT, tier);
  const tmp = path.join(OUT_ROOT, `.tmp-${tier}`);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.rm(tmp, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(tmp, { recursive: true });

  // Pick evenly spaced SOURCE frames. No fps re-timing, so nothing is
  // interpolated — every emitted frame is a real frame from the master.
  //
  // Frame n is kept iff  (n * targetFrames) mod srcFrames < targetFrames,
  // which yields exactly targetFrames frames spread evenly across the source.
  // Listing frames individually as eq(n,0)+eq(n,2)+... overruns ffmpeg's
  // expression parser past ~100 terms, so this stays a single expression.
  // Commas inside a filter argument must be escaped or ffmpeg reads them as
  // filter separators.
  const filters = [];

  // Generator watermarks are fixed-position, so one delogo pass removes them.
  // Coordinates are in SOURCE pixels, which is why this runs before any crop
  // or scale. Purely a placeholder concern — drop the flag for a clean master.
  if (delogo) {
    const [dx, dy, dw, dh] = delogo.split(':').map(Number);
    if ([dx, dy, dw, dh].some((v) => !Number.isFinite(v))) {
      throw new Error('--delogo expects x:y:w:h in source pixels');
    }
    filters.push(`delogo=x=${dx}:y=${dy}:w=${dw}:h=${dh}`);
  }

  if (crop) {
    const { w, h } = cropBox(src, crop);
    filters.push(`crop=${w}:${h}:(iw-ow)/2:(ih-oh)/2`);
  }
  if (targetFrames < src.frames) {
    const c = `\\,`;
    filters.push(`select=lt(mod(n*${targetFrames}${c}${src.frames})${c}${targetFrames})`);
  }
  filters.push(`scale=${targetWidth}:-2:flags=lanczos`);

  const common = ['-y', '-v', 'error', '-i', input, '-vf', filters.join(','), '-fps_mode', 'passthrough'];
  const opts = { maxBuffer: 1 << 28 };

  // --- WebP: the image2 muxer writes valid WebP, so one pass does the lot.
  await run('ffmpeg', [
    ...common,
    '-f', 'image2',
    '-c:v', 'libwebp', '-quality', '72', '-compression_level', '5',
    path.join(dir, '%04d.webp'),
  ], opts);

  // --- AVIF: `-f image2` would dump raw AV1 streams that no browser decodes.
  // Only ffmpeg's dedicated `avif` muxer writes the item metadata an AVIF file
  // needs, and it handles exactly one output file per invocation. So: extract
  // the frames once as PNG, then fan the per-frame encodes across cores.
  await run('ffmpeg', [...common, '-f', 'image2', path.join(tmp, '%04d.png')], opts);

  const pngs = (await fs.readdir(tmp)).filter((f) => f.endsWith('.png')).sort();
  const workers = Math.max(2, Math.min(os.cpus().length - 1, 8));
  let cursor = 0;
  let done = 0;

  const encodeOne = async () => {
    while (cursor < pngs.length) {
      const i = cursor;
      cursor += 1;
      const name = pngs[i];
      await run('ffmpeg', [
        '-y', '-v', 'error',
        '-i', path.join(tmp, name),
        '-c:v', 'libaom-av1', '-still-picture', '1',
        '-crf', '34', '-cpu-used', '6', '-pix_fmt', 'yuv420p',
        path.join(dir, name.replace(/\.png$/, '.avif')),
      ], opts);
      done += 1;
      if (done % 40 === 0) process.stdout.write(`  avif ${done}/${pngs.length}\r`);
    }
  };

  await Promise.all(Array.from({ length: workers }, encodeOne));
  await fs.rm(tmp, { recursive: true, force: true });

  const all = await fs.readdir(dir);
  const written = all.filter((f) => f.endsWith('.avif')).sort();
  if (written.length === 0) throw new Error(`no frames written for tier ${tier}`);
  if (written.length !== pngs.length) {
    throw new Error(`tier ${tier}: expected ${pngs.length} avif frames, got ${written.length}`);
  }

  const first = await probe(path.join(dir, written[0]));

  let bytes = 0;
  for (const f of all) bytes += (await fs.stat(path.join(dir, f))).size;

  return {
    frameCount: written.length,
    width: first.width,
    height: first.height,
    bytes,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args.in ?? 'assets/masters/villa-journey-16x9.mp4';
  const tier = args.tier ?? 'desktop';
  const crop = typeof args.crop === 'string' ? args.crop : null;
  const delogo = typeof args.delogo === 'string' ? args.delogo : null;

  const src = await probe(input);
  const targetFrames = Math.min(Number(args.frames ?? 240), src.frames);

  // Never upscale: stretching a 720p placeholder invents detail that isn't there.
  const availableWidth = crop ? cropBox(src, crop).w : src.width;
  const requested = Number(args.width ?? 1280);
  const clamped = Math.min(requested, availableWidth);
  const targetWidth = clamped - (clamped % 2);

  if (requested > availableWidth) {
    console.warn(`  ! requested width ${requested}px exceeds source ${availableWidth}px — clamped, no upscale`);
  }

  console.log(`> ${tier}: ${input}`);
  console.log(`  source ${src.width}x${src.height}, ${src.frames} frames @ ${src.fps.toFixed(2)}fps`);
  console.log(`  emitting ${targetFrames} frames at ${targetWidth}px${crop ? ` (crop ${crop})` : ''}`);

  const result = await encodeTier({ input, tier, targetFrames, targetWidth, crop, delogo, src });

  let manifest = { version: 1, tiers: {} };
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
  } catch {
    /* first run */
  }
  manifest.tiers ??= {};

  manifest.tiers[tier] = {
    frameCount: result.frameCount,
    width: result.width,
    height: result.height,
    aspect: Number((result.width / result.height).toFixed(4)),
    pattern: `/film/${tier}/{n}.avif`,
    patternFallback: `/film/${tier}/{n}.webp`,
    pad: 4,
  };
  manifest.source = {
    duration: src.duration,
    fps: src.fps,
    width: src.width,
    height: src.height,
  };
  manifest.generatedAt = new Date().toISOString();

  // Poster = first frame. It is the LCP element and the reduced-motion still.
  for (const ext of ['avif', 'webp']) {
    await fs.copyFile(
      path.join(OUT_ROOT, tier, `0001.${ext}`),
      path.join(OUT_ROOT, `poster-${tier}.${ext}`),
    );
  }

  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const mb = (result.bytes / 1024 / 1024).toFixed(1);
  console.log(`  wrote ${result.frameCount} frames, ${result.width}x${result.height}, ${mb}MB (avif+webp)\n`);
}

main().catch((err) => {
  console.error(err.stderr || err.message);
  process.exit(1);
});
