/**
 * Generates lib/mena-map.ts — the real country geometry behind the map on the
 * home page.
 *
 * The reference site draws its region as an animated GIF, which is why its
 * coastlines are approximate and its pins sit wherever the artboard put them.
 * This reads Natural Earth's 1:50m admin-0 boundaries (via world-atlas), keeps
 * the countries that fall inside the MENA window, projects them with the same
 * Mercator the pins use, and writes out SVG path data. Country outlines and pin
 * positions therefore come from one projection, so a pin cannot drift off its
 * own coastline.
 *
 *   node scripts/build-mena-map.mjs
 *
 * The output is committed. Re-run it only to change the window, the country
 * list or the simplification tolerance — not on every build, because it needs
 * the network.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

/** The window the map shows, in degrees. Cairo to Muscat, Kuwait to Salalah. */
const WINDOW = { lonMin: 24, lonMax: 62, latMin: 12, latMax: 34.5 };

/** Rendered width in user units; the height follows from the projection. */
const WIDTH = 1000;

/**
 * Douglas–Peucker tolerance in user units. At 1000 units across ~38° of
 * longitude, 0.45 removes the coastline noise that no one can see at any
 * realistic render size while leaving the Gulf's shape intact.
 */
const TOLERANCE = 0.45;

/** Highlighted — the countries the studio names as its working region. */
const IN_SCOPE = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Bahrain',
  'Kuwait',
  'Oman',
  'Jordan',
  'Egypt',
];

/**
 * Drawn as context so the highlighted countries read as part of a continent
 * rather than as shapes floating in a void. Deliberately unlabelled: the map
 * marks where the studio works, and naming its neighbours would make it a
 * political statement it has no reason to make.
 */
const CONTEXT = [
  'Iran',
  'Iraq',
  'Yemen',
  'Syria',
  'Lebanon',
  'Israel',
  'Palestine',
  'Sudan',
  'Libya',
  'Eritrea',
  'Ethiopia',
  'Djibouti',
  'Somalia',
  'Somaliland',
  'Cyprus',
  'Turkmenistan',
  'Afghanistan',
  'Pakistan',
  'Chad',
  'S. Sudan',
];

/**
 * Pins — geography only.
 *
 * Deliberately no "we have built here" flag: which of these the archive can
 * back is derived at render time from the project records (see
 * lib/projects.ts getProjectsByCity). Baking it in here would be a second
 * source of truth, and the first version of this file had Sharjah marked as
 * delivered when the archive has nothing there.
 */
const CITIES = [
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4539, lon: 54.3773 },
  { name: 'Sharjah', country: 'United Arab Emirates', lat: 25.3463, lon: 55.4209 },
  { name: 'Ajman', country: 'United Arab Emirates', lat: 25.4052, lon: 55.5136 },
  { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.531 },
  { name: 'Manama', country: 'Bahrain', lat: 26.2285, lon: 50.586 },
  { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925 },
  { name: 'Muscat', country: 'Oman', lat: 23.588, lon: 58.3829 },
  { name: 'Amman', country: 'Jordan', lat: 31.9454, lon: 35.9284 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
];

// ---------------------------------------------------------------------------
// TopoJSON decoding. topojson-client would do this, but it is one dependency
// for two functions, and this script is the only thing that would ever import
// it.
// ---------------------------------------------------------------------------

/** Undoes the quantisation in `topology.transform` for one arc. */
function decodeArc(topology, index) {
  const { scale, translate } = topology.transform;
  const arc = topology.arcs[index];
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
}

/** An arc index may be negative, meaning "this arc, reversed". */
function arcRing(topology, indices) {
  const ring = [];
  for (const i of indices) {
    const reversed = i < 0;
    const points = decodeArc(topology, reversed ? ~i : i);
    const ordered = reversed ? [...points].reverse() : points;
    // Consecutive arcs share an endpoint; drop the duplicate.
    ring.push(...(ring.length ? ordered.slice(1) : ordered));
  }
  return ring;
}

/** Every polygon of a country, as rings of [lon, lat]. */
function countryRings(topology, geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.arcs.map((r) => arcRing(topology, r));
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.arcs.flatMap((poly) => poly.map((r) => arcRing(topology, r)));
  }
  return [];
}

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));

// mercatorY grows with latitude but screen y grows downward, so the window's
// northern edge is the origin and every point is measured south of it.
const Y_TOP = mercatorY(WINDOW.latMax);
const Y_BOTTOM = mercatorY(WINDOW.latMin);
const SPAN_X = WINDOW.lonMax - WINDOW.lonMin;
const SCALE = WIDTH / SPAN_X;
const RAD_TO_DEG = 180 / Math.PI;
const HEIGHT = (Y_TOP - Y_BOTTOM) * RAD_TO_DEG * SCALE;

/** [lon, lat] degrees -> [x, y] user units in the output viewBox. */
function project([lon, lat]) {
  return [
    (lon - WINDOW.lonMin) * SCALE,
    (Y_TOP - mercatorY(lat)) * RAD_TO_DEG * SCALE,
  ];
}

// ---------------------------------------------------------------------------
// Simplification
// ---------------------------------------------------------------------------

function perpendicularDistance([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

// ---------------------------------------------------------------------------

const round = (n) => Math.round(n * 10) / 10;

/** Drops rings that are entirely outside the window, and slivers too small to see. */
function keepRing(ring) {
  if (ring.length < 4) return false;
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  if (w < 2 && h < 2) return false; // an islet under ~2/1000 of the width
  return Math.max(...xs) > -40 && Math.min(...xs) < WIDTH + 40
    && Math.max(...ys) > -40 && Math.min(...ys) < HEIGHT + 40;
}

function toPath(rings) {
  return rings
    .map((ring) => {
      const d = ring.map(([x, y]) => `${round(x)} ${round(y)}`);
      return `M${d.join('L')}Z`;
    })
    .join('');
}

async function main() {
  const res = await fetch(ATLAS);
  if (!res.ok) throw new Error(`atlas fetch failed: ${res.status}`);
  const topology = await res.json();

  const wanted = new Map([...IN_SCOPE, ...CONTEXT].map((n) => [n, IN_SCOPE.includes(n)]));
  const countries = [];

  for (const geometry of topology.objects.countries.geometries) {
    const name = geometry.properties?.name;
    if (!wanted.has(name)) continue;

    const rings = countryRings(topology, geometry)
      .map((ring) => simplify(ring.map(project), TOLERANCE))
      .filter(keepRing);

    if (!rings.length) continue;
    countries.push({ name, inScope: wanted.get(name), d: toPath(rings) });
  }

  const missing = [...wanted.keys()].filter((n) => !countries.some((c) => c.name === n));

  const cities = CITIES.map(({ name, country, lat, lon }) => {
    const [x, y] = project([lon, lat]);
    return { name, country, x: round(x), y: round(y) };
  });

  const file = `/**
 * Generated by scripts/build-mena-map.mjs — do not edit by hand.
 *
 * Country outlines are Natural Earth 1:50m admin-0 boundaries, Mercator-projected
 * into the viewBox below. City pins use the same projection, so a pin is on its
 * real coastline rather than wherever an artboard put it.
 */

export type MenaCountry = {
  name: string;
  /** True for the countries the studio names as its working region. */
  inScope: boolean;
  d: string;
};

export type MenaCity = {
  name: string;
  country: string;
  x: number;
  y: number;
};

export const MENA_VIEWBOX = '0 0 ${round(WIDTH)} ${round(HEIGHT)}';
export const MENA_WIDTH = ${round(WIDTH)};
export const MENA_HEIGHT = ${round(HEIGHT)};

export const MENA_COUNTRIES: MenaCountry[] = ${JSON.stringify(countries, null, 2)};

export const MENA_CITIES: MenaCity[] = ${JSON.stringify(cities, null, 2)};
`;

  const out = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'lib',
    'mena-map.ts',
  );
  await writeFile(out, file, 'utf8');

  const bytes = Buffer.byteLength(file);
  console.log(
    `lib/mena-map.ts — ${countries.length} countries, ${cities.length} cities, ` +
      `${(bytes / 1024).toFixed(1)} kB, viewBox 0 0 ${round(WIDTH)} ${round(HEIGHT)}`,
  );
  if (missing.length) console.warn(`not found in atlas: ${missing.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
