#!/usr/bin/env node
/**
 * build-trial.mjs — a static, home-page-only build for shared hosting.
 *
 * Produces dist/menaarc-home-trial.zip: upload its contents to public_html on
 * Namecheap (or any Apache host) and the home page runs with no Node process.
 *
 * Next has no way to exclude routes from an export, so this temporarily moves
 * the other routes aside, builds, and puts them back. That is why it refuses to
 * run on a dirty tree — if the restore ever failed, `git status` has to be the
 * thing that tells you, and it can only do that from a clean baseline. The
 * restore runs in a finally block and is verified before the script exits.
 *
 *   npm run build:trial
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const STASH = '.trial-stash';
const OUT = 'out';
const DIST = 'dist';
const ZIP_NAME = 'menaarc-home-trial.zip';

/** Routes that do not exist on a home-only host. */
const MOVE = [
  'app/work',
  'app/studio',
  'app/services',
  'app/contact',
  'app/api',
  'app/sitemap.ts',
  'app/robots.ts',
];

const run = (cmd, args, env) =>
  execFileSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });

function assertCleanTree() {
  const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (status) {
    console.error(
      'Refusing to run with uncommitted changes.\n' +
        'This script moves routes out of app/ and back again; a clean tree is\n' +
        'what lets you confirm the restore worked. Commit or stash first.\n\n' +
        status,
    );
    process.exit(1);
  }
}

function stashRoutes() {
  fs.mkdirSync(STASH, { recursive: true });
  for (const rel of MOVE) {
    if (!fs.existsSync(rel)) continue;
    const dest = path.join(STASH, rel.replace(/[\\/]/g, '__'));
    fs.renameSync(rel, dest);
  }
}

function restoreRoutes() {
  if (!fs.existsSync(STASH)) return;
  for (const name of fs.readdirSync(STASH)) {
    const rel = name.replace(/__/g, path.sep);
    fs.mkdirSync(path.dirname(rel), { recursive: true });
    fs.renameSync(path.join(STASH, name), rel);
  }
  fs.rmSync(STASH, { recursive: true, force: true });
}

/**
 * Apache on shared hosting frequently has no MIME type for AVIF. Served as
 * application/octet-stream the browser will not decode it, and the scroll film
 * silently renders nothing — so this file is not optional.
 */
const HTACCESS = `# Serve modern image formats with the right type. Without this Apache sends
# AVIF as application/octet-stream and the scroll film never paints.
AddType image/avif  .avif
AddType image/webp  .webp
AddType font/woff2  .woff2

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  # Hashed build assets and film frames never change under the same name.
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/html "access plus 10 minutes"
</IfModule>

ErrorDocument 404 /404.html
`;

/** Instructions travel with the zip, so it is usable without this chat. */
const UPLOAD_NOTES = `MENAARC — home page, static trial build
========================================

WHAT THIS IS
  The home page only, exported as plain HTML/CSS/JS. No Node, no database.
  Every link to another page has been removed, because no other page is in
  this build. Email, phone and the social profiles still work.

HOW TO UPLOAD (Namecheap cPanel)
  1. cPanel > File Manager > public_html
  2. Delete the default placeholder page if one is there
     (usually index.html or default.html)
  3. Upload this zip into public_html, then use "Extract"
  4. Make sure the files land DIRECTLY in public_html — you should see
     index.html at the top level, not a folder containing it
  5. Turn on "Show Hidden Files" in File Manager settings and confirm
     .htaccess is present

  .htaccess IS REQUIRED. The scroll film is made of AVIF images, and
  without it Apache serves them as a generic download instead of an
  image — the film renders as a blank screen.

FIRST LOAD
  About 5MB of image frames load before the film can be scrubbed. The
  wordmark and a progress line show while that happens. Shared hosting
  has no CDN, so the first visit from outside the UAE may take a few
  seconds.

WHAT IS NOT IN THIS BUILD
  Work, Studio, Services and Contact pages. The contact form. The
  sitemap and robots.txt (deliberately — a trial should not be indexed).
`;

/** Drop project photography the home page never references. */
function pruneImages() {
  const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  const dir = path.join(OUT, 'projects');
  if (!fs.existsSync(dir)) return { kept: 0, removed: 0 };

  let kept = 0;
  let removed = 0;
  for (const slug of fs.readdirSync(dir)) {
    const slugDir = path.join(dir, slug);
    if (!fs.statSync(slugDir).isDirectory()) continue;
    for (const file of fs.readdirSync(slugDir)) {
      // next/image with unoptimized rewrites nothing, so the src in the HTML is
      // the literal /projects/<slug>/<file> path.
      if (html.includes(`/projects/${slug}/${file}`)) {
        kept += 1;
      } else {
        fs.rmSync(path.join(slugDir, file));
        removed += 1;
      }
    }
    if (fs.readdirSync(slugDir).length === 0) fs.rmdirSync(slugDir);
  }
  return { kept, removed };
}

function dirSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(full) : fs.statSync(full).size;
  }
  return total;
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;

function main() {
  assertCleanTree();

  const configPath = 'next.config.ts';
  const originalConfig = fs.readFileSync(configPath, 'utf8');

  try {
    stashRoutes();

    fs.writeFileSync(
      configPath,
      `import type { NextConfig } from 'next';

// Written by scripts/build-trial.mjs; the original is restored afterwards.
const nextConfig: NextConfig = {
  output: 'export',
  // No Node process on shared hosting, so nothing can optimise images at
  // request time. Everything under public/ is already pre-optimised.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
`,
    );

    fs.rmSync(OUT, { recursive: true, force: true });

    // Next writes route-type validators into .next from whatever routes existed
    // at the time. Left in place from a dev run they still reference the routes
    // this script just moved aside, and the build fails type-checking against
    // files that are no longer there.
    fs.rmSync('.next', { recursive: true, force: true });

    run('npx', ['next', 'build'], { NEXT_PUBLIC_TRIAL: '1' });
  } finally {
    fs.writeFileSync(configPath, originalConfig);
    restoreRoutes();
  }

  // Prove the working tree came back exactly as it was.
  const after = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  const stray = after
    .split('\n')
    .filter(Boolean)
    .filter((l) => !/\s(out|dist)\//.test(l));
  if (stray.length) {
    console.error('\nRestore did not come back clean:\n' + stray.join('\n'));
    process.exit(1);
  }

  const before = dirSize(OUT);
  const pruned = pruneImages();
  fs.writeFileSync(path.join(OUT, '.htaccess'), HTACCESS);
  fs.writeFileSync(path.join(OUT, 'UPLOAD-README.txt'), UPLOAD_NOTES);

  fs.mkdirSync(DIST, { recursive: true });
  const zipPath = path.join(DIST, ZIP_NAME);
  fs.rmSync(zipPath, { force: true });

  const winOut = path.resolve(OUT);
  const winZip = path.resolve(zipPath);

  // Run WITHOUT shell:true. Routed through cmd.exe a PowerShell -Command
  // argument gets mangled — cmd splits it on "|" and strips its double quotes.
  const ps = (script, opts = {}) =>
    execFileSync('powershell', ['-NoProfile', '-Command', script], {
      encoding: 'utf8',
      maxBuffer: 1 << 26,
      ...opts,
    });

  /**
   * Entries are named explicitly, with forward slashes.
   *
   * Compress-Archive writes Windows separators into the archive
   * ("film\\desktop\\0001.avif"). The ZIP spec requires "/", and Linux
   * extractors — cPanel's included — read a backslash as part of the filename
   * rather than a directory. The upload would appear to succeed and then every
   * asset would 404. Asserted below so it cannot come back.
   */
  ps(
    `$ErrorActionPreference='Stop'; ` +
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
      `$src='${winOut}'; ` +
      `$z=[System.IO.Compression.ZipFile]::Open('${winZip}','Create'); ` +
      `Get-ChildItem -Path $src -Recurse -File -Force | ForEach-Object { ` +
      `  $rel=$_.FullName.Substring($src.Length+1).Replace('\\','/'); ` +
      `  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z,$_.FullName,$rel,'Optimal') | Out-Null ` +
      `}; ` +
      `$z.Dispose()`,
  );

  const report = ps(
    `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
      `$z=[System.IO.Compression.ZipFile]::OpenRead('${winZip}'); ` +
      `$names=$z.Entries.FullName; ` +
      `Write-Output $names.Count; ` +
      `Write-Output ($names -contains '.htaccess'); ` +
      `Write-Output ($names -contains 'index.html'); ` +
      `Write-Output (@($names | Where-Object { $_ -like '*\\*' }).Count); ` +
      `$z.Dispose()`,
  ).trim();

  const [count, hasHtaccess, hasIndex, backslashes] = report
    .split(/\r?\n/)
    .map((l) => l.trim());

  const fail = (msg) => {
    console.error(`\n${msg}`);
    process.exit(1);
  };
  if (hasHtaccess !== 'True') fail('Archive is missing .htaccess — AVIF would not be served.');
  if (hasIndex !== 'True') fail('Archive is missing index.html at the top level.');
  if (backslashes !== '0') {
    fail(`${backslashes} entries use backslash separators — they will not extract as folders.`);
  }

  const after2 = dirSize(OUT);
  console.log('\n--- home-only trial build ---');
  console.log(`  pruned ${pruned.removed} unused project images, kept ${pruned.kept}`);
  console.log(`  output  ${mb(before)} -> ${mb(after2)}`);
  console.log(`  zip     ${zipPath}  (${mb(fs.statSync(zipPath).size)}, ${count} entries, forward-slash paths, .htaccess included)`);
  console.log('\n  Upload the CONTENTS of the zip into public_html (including .htaccess).');
}

main();
