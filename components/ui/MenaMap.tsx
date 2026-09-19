'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

import { MENA_CITIES, MENA_COUNTRIES, MENA_VIEWBOX } from '@/lib/mena-map';
import { usePrefersReducedMotion } from '@/lib/use-media-query';

/**
 * The region — a real map you can move around in, drawn rather than tiled.
 *
 * The geometry is Natural Earth 1:50m coastlines and borders, Mercator-
 * projected by scripts/build-mena-map.mjs, with every marker run through the
 * same projection. That is the point of not using an illustrated map: a marker
 * cannot end up in the sea, and the Gulf is the shape the Gulf actually is.
 *
 * WHY NOT LEAFLET AND A TILE LAYER. It does not pull raster tiles from a third
 * party: this site ships static, has no third-party request on the critical
 * path, and every other drawing on it is linework. Satellite tiles would be the
 * one photographic surface on the site and would carry someone else's
 * cartography and attribution through the middle of it.
 *
 * IT IS A DRAWING, NOT A SLIPPY MAP. An earlier version panned, pinched and
 * zoomed. It is gone, and the affordance was the whole problem: a grab cursor
 * over a surface that shifts a little promises a map you can go anywhere in,
 * and then the pan runs into a clamp and the zoom has nowhere useful to go. The
 * map spent its entire interaction budget advertising something it could not
 * pay out. What people came for is the markers, so the markers are now the only
 * thing that responds, and the cursor no longer claims otherwise.
 *
 * HOW THE COORDINATES WORK. One piece of state — `view`, a rectangle in map
 * units — drives both the SVG's viewBox and the HTML markers. The rectangle is
 * recomputed to the stage's exact aspect ratio on every resize, so the SVG
 * needs no slice/meet cropping and a marker's pixel position is a plain linear
 * map of its map coordinate. Anything else means two transforms that have to
 * agree, and they stop agreeing the first time the container changes shape.
 *
 * THE MARKERS DROP IN. They arrive with the section, staggered north to south,
 * because a map that is already fully marked when you reach it reads as a
 * background image — the drop is what says these were placed, and that there is
 * something here to open. Under reduced motion they are simply already there.
 */

const [, , VB_W, VB_H] = MENA_VIEWBOX.split(' ').map(Number);

export type CityProjects = {
  city: string;
  projects: { slug: string; title: string; location: string }[];
};

/**
 * Where a marker is drawn, when its true position is too crowded to draw on.
 * In map units. Ajman is 7 units from Dubai — a few pixels at the default
 * zoom — so it moves out over the water and keeps a leader line home.
 */
const DISPLACE: Record<string, { dx: number; dy: number }> = {
  Ajman: { dx: 58, dy: -58 },
  Sharjah: { dx: 30, dy: -30 },
};

/**
 * How the map is framed. There is only one framing — see the header.
 *
 * The centre of the marked places, not the centre of the data. At zoom 1 the
 * view fills the frame, which on a wide desktop section means cropping top and
 * bottom — and the data's midpoint sits low enough that Amman fell off the top
 * edge. Framing on what is actually marked cannot have that failure.
 */
const FOCUS = (() => {
  const xs = MENA_CITIES.map((c) => c.x);
  const ys = MENA_CITIES.map((c) => c.y);
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
})();

/** A 5° graticule. Degrees -> map units. */
const GRATICULE_STEP = 5;
const LON = { min: 24, max: 62 };
const LAT = { min: 12, max: 34.5 };

const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
const Y_TOP = mercatorY(LAT.max);
const SCALE = VB_W / (LON.max - LON.min);
const RAD_TO_DEG = 180 / Math.PI;

const gx = (lon: number) => (lon - LON.min) * SCALE;
const gy = (lat: number) => (Y_TOP - mercatorY(lat)) * RAD_TO_DEG * SCALE;

function graticule() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let lon = Math.ceil(LON.min / GRATICULE_STEP) * GRATICULE_STEP; lon < LON.max; lon += GRATICULE_STEP) {
    lines.push({ x1: gx(lon), y1: 0, x2: gx(lon), y2: VB_H });
  }
  for (let lat = Math.ceil(LAT.min / GRATICULE_STEP) * GRATICULE_STEP; lat < LAT.max; lat += GRATICULE_STEP) {
    lines.push({ x1: 0, y1: gy(lat), x2: VB_W, y2: gy(lat) });
  }
  return lines;
}

const GRATICULE = graticule();

type Stage = { w: number; h: number };
type View = { cx: number; cy: number; z: number };

/**
 * The visible rectangle in map units, for a given centre, zoom and stage shape.
 *
 * At zoom 1 the whole map is covered — the shorter axis is filled and the
 * longer one shows more than the data, which is what "the map fills the frame"
 * means for a frame that is not 1000x650.
 */
function rect(view: View, stage: Stage) {
  if (stage.w === 0 || stage.h === 0) return { x: 0, y: 0, w: VB_W, h: VB_H };
  const stageAspect = stage.w / stage.h;
  const dataAspect = VB_W / VB_H;

  let w: number;
  let h: number;
  if (stageAspect > dataAspect) {
    // Wider than the data: the width is the binding dimension.
    w = VB_W / view.z;
    h = w / stageAspect;
  } else {
    h = VB_H / view.z;
    w = h * stageAspect;
  }
  return { x: view.cx - w / 2, y: view.cy - h / 2, w, h };
}

/** The one view there is. Fixed, so nothing downstream has to track a camera. */
const BASE_VIEW: View = { ...FOCUS, z: 1 };

/** How long between one pin landing and the next. */
const PIN_STAGGER_MS = 65;

export function MenaMap({ built }: { built: CityProjects[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ w: 0, h: 0 });
  const [scrolledTo, setScrolledTo] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStage({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Drop the pins once, when the map has actually been scrolled to.
   *
   * Disconnected on the first hit rather than left listening: this is an
   * arrival, not a state the map goes in and out of, and a marker that re-drops
   * every time it crosses the viewport edge turns into a twitch on the way back
   * up the page.
   */
  useEffect(() => {
    if (reduced) return;
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setScrolledTo(true);
        obs.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // Derived rather than an effect that sets state: under reduced motion the
  // pins are simply already down, which is a fact about the render, not a
  // transition the map has to be walked through.
  const dropped = reduced || scrolledTo;

  const r = rect(BASE_VIEW, stage);

  /** Map units -> stage pixels. The one conversion everything else goes through. */
  const toPx = useCallback(
    (x: number, y: number) => ({
      left: ((x - r.x) / r.w) * stage.w,
      top: ((y - r.y) / r.h) * stage.h,
    }),
    [r.x, r.y, r.w, r.h, stage.w, stage.h],
  );

  const byCity = new Map(built.map((b) => [b.city, b.projects]));

  const markers = MENA_CITIES.map((city) => {
    const nudge = DISPLACE[city.name];
    const mx = city.x + (nudge?.dx ?? 0);
    const my = city.y + (nudge?.dy ?? 0);
    const px = toPx(mx, my);
    return {
      ...city,
      projects: byCity.get(city.name) ?? [],
      mx,
      my,
      displaced: Boolean(nudge),
      ...px,
      // Which way the label and the card open is decided by where the marker
      // actually is right now, not by a table — at zoom, a marker that was
      // comfortably left of centre is not any more.
      side: px.left > stage.w * 0.58 ? ('left' as const) : ('right' as const),
      // Outside the frame there is nothing to point at, and a marker parked on
      // the edge would look like part of the border.
      outside:
        px.left < -40 || px.left > stage.w + 40 || px.top < -40 || px.top > stage.h + 40,
    };
  });

  // Pins land north to south. Ranking by drawn position rather than by the
  // data's order means the stagger still reads correctly at any stage shape,
  // and a displaced marker drops with where it is shown, not where it belongs.
  const dropOrder = new Map(
    [...markers].sort((a, b) => a.top - b.top).map((m, i) => [m.name, i]),
  );

  const openMarker = markers.find((m) => m.name === active && !m.outside) ?? null;

  return (
    <div className="mena-stage" ref={stageRef}>
      <div
        className="mena-surface"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setActive(null);
        }}
      >
        <svg
          viewBox={`${r.x} ${r.y} ${r.w} ${r.h}`}
          className="mena-map"
          role="img"
          aria-labelledby={`${baseId}-title ${baseId}-desc`}
        >
          <title id={`${baseId}-title`}>Where MENAARC works</title>
          <desc id={`${baseId}-desc`}>
            A map of the Middle East and North Africa. The United Arab Emirates, Saudi Arabia,
            Qatar, Bahrain, Kuwait, Oman, Jordan and Egypt are highlighted. Marked places:{' '}
            {MENA_CITIES.map((c) => c.name).join(', ')}.
          </desc>

          <g aria-hidden="true">
            {GRATICULE.map((l, i) => (
              <line key={i} {...l} stroke="currentColor" strokeWidth={0.6} className="mena-grid" />
            ))}

            {/* Neighbours first, so a shared border is overdrawn by the working
                country rather than the other way round. */}
            {MENA_COUNTRIES.filter((c) => !c.inScope).map((c) => (
              <path key={c.name} d={c.d} className="mena-country" />
            ))}
            {MENA_COUNTRIES.filter((c) => c.inScope).map((c) => (
              <path key={c.name} d={c.d} className="mena-country mena-country--scope" />
            ))}

            {markers
              .filter((m) => m.displaced)
              .map((m) => (
                <g key={m.name} className="mena-leader">
                  <line x1={m.x} y1={m.y} x2={m.mx} y2={m.my} />
                  <circle cx={m.x} cy={m.y} r={2.4} />
                </g>
              ))}
          </g>
        </svg>

        {/* Markers are HTML over the drawing: real buttons, real focus order,
            hit areas in px and labels in rem rather than in map units. */}
        {markers.map((m) => {
          if (m.outside) return null;
          const isOpen = active === m.name;
          return (
            <div
              key={m.name}
              className="mena-marker"
              data-built={m.projects.length > 0 || undefined}
              data-dropped={dropped || undefined}
              data-open={isOpen || undefined}
              data-side={m.side}
              style={
                {
                  left: `${m.left}px`,
                  top: `${m.top}px`,
                  '--pin-delay': `${(dropOrder.get(m.name) ?? 0) * PIN_STAGGER_MS}ms`,
                } as React.CSSProperties
              }
            >
              <button
                type="button"
                className="mena-marker__hit"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-card`}
                onClick={() => setActive(isOpen ? null : m.name)}
                onFocus={() => setActive(m.name)}
                onMouseEnter={() => setActive(m.name)}
              >
                <span aria-hidden="true" className="mena-marker__dot" />
                <span className="mena-marker__name">
                  {m.name}
                  <span className="sr-only">
                    {m.projects.length > 0
                      ? ` — ${m.projects.length} published project${m.projects.length === 1 ? '' : 's'}`
                      : ' — working across'}
                  </span>
                </span>
              </button>
            </div>
          );
        })}

        {/* One card, not one per marker.
            Anchored to the stage rather than nested inside the marker, because
            a popover hung off a marker can only ever open in four directions
            and the tallest of these lists ran off the bottom edge whichever one
            it picked. Out here it can be pinned to the marker on a wide screen
            and to the foot of the map on a narrow one, which is what a map does
            on a phone. */}
        {openMarker ? (
          <div
            id={`${baseId}-card`}
            className="mena-card"
            data-side={openMarker.side}
            data-vertical={openMarker.top > stage.h * 0.5 ? 'above' : 'below'}
            style={{ left: `${openMarker.left}px`, top: `${openMarker.top}px` }}
          >
            <p className="mena-card__place">{openMarker.name}</p>
            {openMarker.projects.length > 0 ? (
              <ul className="mena-card__list">
                {openMarker.projects.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/work/${p.slug}`}>
                      {p.title}
                      <span className="mena-card__where">{p.location}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mena-card__note">
                Within the studio&rsquo;s working region. Nothing published here yet.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
