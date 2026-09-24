'use client';

import { useEffect, useRef } from 'react';
import { Map as MaplibreMap, Marker, NavigationControl, setWorkerUrl, type LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LOCATIONS, ROUTES_GEOJSON } from '@/lib/map-data';

import { CUSTOM_DARK_STYLE } from '@/lib/custom-dark-style';

// MapLibre resolves its worker relative to its own module URL, which the
// bundler rewrites to a chunk path with no worker beside it — the request 404s
// into an HTML page, the style never loads and the map stays blank. The
// postinstall script copies the worker (and the chunk it imports) to public/.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

export type CityProjects = {
  city: string;
  projects: { slug: string; title: string; location: string }[];
};

/**
 * The overview frames every location; each place gets its own view, a box
 * around it sized so a single emirate reads at street-grid scale and a city
 * abroad shows enough of its surroundings to be placed.
 */
export const ALL_PLACES = 'all';

const around = ([lng, lat]: number[], d: number): LngLatBoundsLike => [
  [lng - d, lat - d],
  [lng + d, lat + d],
];

function boundsOf(points: { coordinates: number[] }[]): LngLatBoundsLike {
  const lngs = points.map((p) => p.coordinates[0]);
  const lats = points.map((p) => p.coordinates[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

const VIEWS: Record<string, LngLatBoundsLike> = {
  [ALL_PLACES]: boundsOf(LOCATIONS),
  ...Object.fromEntries(
    LOCATIONS.map((l) => [l.id, around(l.coordinates, l.type === 'emirate' ? 0.35 : 2)]),
  ),
};

/**
 * Room for marker labels (they sit to the right of each dot) and, from md up,
 * for the copy column that overlays the left of the map.
 */
function fitPadding(el: HTMLElement) {
  const w = el.clientWidth;
  return w >= 768
    ? { top: 96, bottom: 64, left: Math.round(w * 0.46), right: 140 }
    : { top: 28, bottom: 28, left: 28, right: 110 };
}

export function MenaGlobalMap({ built, activePlace }: { built: CityProjects[]; activePlace: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const placeRef = useRef(activePlace);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent double init in Strict Mode

    const map = new MaplibreMap({
      container: mapContainerRef.current,
      style: CUSTOM_DARK_STYLE,
      bounds: VIEWS[placeRef.current],
      fitBoundsOptions: { padding: fitPadding(mapContainerRef.current) },
      attributionControl: false,
      // Zoom and pan without trapping the page: a plain wheel or one-finger
      // swipe still scrolls the page, while a trackpad pinch (which arrives as
      // ctrl + wheel), ctrl/cmd + wheel, or a two-finger pinch on a phone
      // moves the map. MapLibre shows a hint when a gesture is passed through.
      cooperativeGestures: true,
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
      minZoom: 1,
      doubleClickZoom: true,
      boxZoom: false,
      dragRotate: false,
      pitchWithRotate: false
    });

    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    // Zoomed out, nearby labels pile into one smudge. After each move, walk
    // the markers in priority order and hide any label that would collide
    // with a label already shown or with a higher-priority marker's dot. The
    // first marker (Dubai) therefore always keeps its label.
    const declutter = () => {
      const markers = markersRef.current.map((m) => m.getElement());
      const dots = markers.map((el) => el.querySelector('.marker-core')!.getBoundingClientRect());
      const shown: DOMRect[] = [];
      const hits = (r: DOMRect, o: DOMRect) =>
        r.left < o.right && r.right > o.left && r.top < o.bottom && r.bottom > o.top;

      // Below this zoom the emirates are a few pixels apart; name only Dubai.
      const far = map.getZoom() < 5.5;

      markers.forEach((el, i) => {
        const label = el.querySelector<HTMLElement>('.marker-label')!;
        label.style.visibility = 'visible';
        const r = label.getBoundingClientRect();
        const clash =
          (far && el.classList.contains('mena-map-marker--secondary')) ||
          shown.some((o) => hits(r, o)) ||
          dots.slice(0, i).some((d) => hits(r, d));
        label.style.visibility = clash ? 'hidden' : 'visible';
        if (!clash) shown.push(r);
      });
    };
    map.on('moveend', declutter);

    // Keep the active place framed when the container changes size.
    map.on('resize', () => {
      map.fitBounds(VIEWS[placeRef.current], { padding: fitPadding(map.getContainer()), animate: false });
    });

    map.on('load', () => {
      // Routes (network lines)
      map.addSource('routes', {
        type: 'geojson',
        data: ROUTES_GEOJSON
      });

      map.addLayer({
        id: 'routes-line',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.15)',
          'line-width': 1.5,
          'line-dasharray': [2, 2]
        }
      });

      // Priority order for labels: the Dubai hub, then places with built
      // work, then everything else as listed.
      const hasProjects = (name: string) => built.some((b) => b.city.toUpperCase() === name);
      const rank = (id: string, name: string) => (id === 'dubai' ? 0 : hasProjects(name) ? 1 : 2);
      const ordered = [...LOCATIONS].sort((a, b) => rank(a.id, a.name) - rank(b.id, b.name));

      ordered.forEach((loc) => {
        const el = document.createElement('div');
        
        if (loc.id === 'dubai') {
          el.className = 'mena-map-marker mena-map-marker--primary';
          el.innerHTML = `
            <span class="marker-pulse"></span>
            <span class="marker-core"></span>
            <span class="marker-label marker-label--primary">${loc.name}</span>
          `;
        } else if (loc.type === 'emirate') {
          el.className = 'mena-map-marker mena-map-marker--secondary';
          el.innerHTML = `
            <span class="marker-core"></span>
            <span class="marker-label">${loc.name}</span>
          `;
        } else {
          el.className = 'mena-map-marker mena-map-marker--intl';
          el.innerHTML = `
            <span class="marker-core"></span>
            <span class="marker-label">${loc.name}</span>
          `;
        }

        if (hasProjects(loc.name) && loc.id !== 'dubai') {
          el.classList.add('mena-map-marker--built');
        }
        el.dataset.place = loc.id;
        el.classList.toggle('mena-map-marker--active', loc.id === placeRef.current);
        if (loc.labelSide === 'left') {
          el.querySelector('.marker-label')!.classList.add('marker-label--left');
        }

        const marker = new Marker({ element: el }).setLngLat(loc.coordinates).addTo(map);
        markersRef.current.push(marker);
      });

      declutter();
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [built]);

  // Fly to the chosen place and mark it, so the one that was picked is
  // obvious even among the tightly packed emirates.
  useEffect(() => {
    placeRef.current = activePlace;
    const bounds = VIEWS[activePlace];
    if (!mapRef.current || !bounds) return;
    const map = mapRef.current;
    for (const m of markersRef.current) {
      const el = m.getElement();
      el.classList.toggle('mena-map-marker--active', el.dataset.place === activePlace);
    }
    map.fitBounds(bounds, { padding: fitPadding(map.getContainer()), duration: 1400, essential: true });
  }, [activePlace]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 0 }}>
      <div
        ref={mapContainerRef}
        id="mena-map"
        className="w-full h-full pointer-events-auto"
      />
    </div>
  );
}
