'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

import { MENA_CITIES, MENA_COUNTRIES, MENA_VIEWBOX } from '@/lib/mena-map';

/**
 * The region — a real map you can move around in, drawn rather than tiled.
 *
 * The geometry is Natural Earth 1:50m coastlines and borders, Mercator-
 * projected by scripts/build-mena-map.mjs, with every marker run through the
 * same projection. That is the point of not using an illustrated map: a marker
 * cannot end up in the sea, and the Gulf is the shape the Gulf actually is.
 *
 * WHY NOT LEAFLET AND A TILE LAYER. The reference this is modelled on uses a
 * slippy map behind a gradient, and this matches its behaviour — drag to pan,
 * zoom, markers that open. What it does not do is pull raster tiles from a
 * third party: this site ships static, has no third-party request on the
 * critical path, and every other drawing on it is linework. Satellite tiles
 * would be the one photographic surface on the site and would carry someone
 * else's cartography and attribution through the middle of it.
 *
 * HOW THE COORDINATES WORK. One piece of state — `view`, a rectangle in map
 * units — drives both the SVG's viewBox and the HTML markers. The rectangle is
 * recomputed to the stage's exact aspect ratio on every resize, so the SVG
 * needs no slice/meet cropping and a marker's pixel position is a plain linear
 * map of its map coordinate. Anything else means two transforms that have to
 * agree, and they stop agreeing the first time the container changes shape.
 *
 * WHEEL IS DEACTIVATED ON PURPOSE. A map that zooms on wheel inside a scrolling
 * page traps the scroll, which is the single most complained-about behaviour in
 * embedded maps. Zoom is on the buttons, on double-click, and on pinch.
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

/**
 * Where the map opens, and what "reset" goes back to.
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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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

/** Keeps the view centre inside the data, so the map cannot be dragged into empty space. */
function clampView(view: View, stage: Stage): View {
  const r = rect({ ...view, cx: VB_W / 2, cy: VB_H / 2 }, stage);
  const halfW = r.w / 2;
  const halfH = r.h / 2;
  // Where the visible rectangle is bigger than the data on an axis, the centre
  // is pinned; otherwise it may travel to the data's edge.
  const cx = halfW >= VB_W / 2 ? VB_W / 2 : clamp(view.cx, halfW, VB_W - halfW);
  const cy = halfH >= VB_H / 2 ? VB_H / 2 : clamp(view.cy, halfH, VB_H - halfH);
  return { ...view, cx, cy };
}

export function MenaMap({ built }: { built: CityProjects[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ ...FOCUS, z: 1 });
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; z: number } | null>(null);
  const baseId = useId();

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

  const r = rect(view, stage);

  /** Map units -> stage pixels. The one conversion everything else goes through. */
  const toPx = useCallback(
    (x: number, y: number) => ({
      left: ((x - r.x) / r.w) * stage.w,
      top: ((y - r.y) / r.h) * stage.h,
    }),
    [r.x, r.y, r.w, r.h, stage.w, stage.h],
  );

  const zoomBy = useCallback(
    (factor: number) =>
      setView((v) => clampView({ ...v, z: clamp(v.z * factor, MIN_ZOOM, MAX_ZOOM) }, stage)),
    [stage],
  );

  const reset = useCallback(() => {
    setView({ ...FOCUS, z: 1 });
    setActive(null);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // Never start a drag from a marker or a card — those are controls.
    if ((e.target as HTMLElement).closest('.mena-marker')) return;
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: view.z };
      drag.current = null;
      setDragging(false);
      return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pinch.current.has(e.pointerId)) {
      pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pinch.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pinch.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const next = clamp(
        (pinchStart.current.z * dist) / pinchStart.current.dist,
        MIN_ZOOM,
        MAX_ZOOM,
      );
      setView((v) => clampView({ ...v, z: next }, stage));
      return;
    }

    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // Pixels dragged translate to map units through the current rectangle, so
    // the map tracks the finger exactly at every zoom.
    const dxUnits = ((e.clientX - d.x) / stage.w) * r.w;
    const dyUnits = ((e.clientY - d.y) / stage.h) * r.h;
    drag.current = { ...d, x: e.clientX, y: e.clientY };
    setView((v) => clampView({ ...v, cx: v.cx - dxUnits, cy: v.cy - dyUnits }, stage));
  };

  const endPointer = (e: React.PointerEvent) => {
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchStart.current = null;
    if (drag.current?.id === e.pointerId) {
      drag.current = null;
      setDragging(false);
    }
  };

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

  const openMarker = markers.find((m) => m.name === active && !m.outside) ?? null;

  return (
    <div className="mena-stage" ref={stageRef}>
      <div
        className="mena-surface"
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={() => zoomBy(1.6)}
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
              data-open={isOpen || undefined}
              data-side={m.side}
              style={{ left: `${m.left}px`, top: `${m.top}px` }}
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

      <div className="mena-controls">
        <button type="button" onClick={() => zoomBy(1.5)} disabled={view.z >= MAX_ZOOM}>
          <span aria-hidden="true">+</span>
          <span className="sr-only">Zoom in</span>
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.5)} disabled={view.z <= MIN_ZOOM}>
          <span aria-hidden="true">−</span>
          <span className="sr-only">Zoom out</span>
        </button>
        <button type="button" onClick={reset} disabled={view.z === 1}>
          <span aria-hidden="true">⤾</span>
          <span className="sr-only">Reset the map</span>
        </button>
      </div>
    </div>
  );
}
