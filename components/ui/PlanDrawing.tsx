import { Reveal } from '@/components/ui/Reveal';

/**
 * Fragments of floor plan, drawn in as a section arrives.
 *
 * The kinds of unit this studio actually works on: a fashion unit with a
 * shopfront to the mall, a restaurant with its kitchen behind a pass, and a
 * stair-and-lift core. The drawing conventions are the real ones — walls as
 * double lines, door leaves with their swing arcs, columns crossed through,
 * dimension strings with oblique ticks in CAD blue — because a plan that gets
 * the conventions wrong reads as clip art to exactly the people this site is
 * for.
 *
 * Plans are data rather than hand-written SVG so every element can take its
 * own draw delay: walls first, then fit-out, then the dimensions — roughly the
 * order a plan is actually drawn in.
 */

type Kind = 'wall' | 'fit' | 'furn' | 'dim';

type Mark =
  | { t: 'rect'; k: Kind; x: number; y: number; w: number; h: number; rx?: number }
  | { t: 'line'; k: Kind; x1: number; y1: number; x2: number; y2: number; dash?: boolean }
  | { t: 'path'; k: Kind; d: string }
  | { t: 'circle'; k: Kind; cx: number; cy: number; r: number }
  | { t: 'text'; x: number; y: number; s: string; anchor?: 'start' | 'middle' | 'end' };

/** Oblique tick at a dimension point — the architectural mark, not an arrowhead. */
const tick = (x: number, y: number): Mark => ({ t: 'line', k: 'dim', x1: x - 4, y1: y + 4, x2: x + 4, y2: y - 4 });

/** A column: a square crossed through. */
const column = (x: number, y: number, s = 12): Mark[] => [
  { t: 'rect', k: 'wall', x, y, w: s, h: s },
  { t: 'line', k: 'wall', x1: x, y1: y, x2: x + s, y2: y + s },
  { t: 'line', k: 'wall', x1: x + s, y1: y, x2: x, y2: y + s },
];

/** A horizontal dimension string with extension lines down to the drawing. */
function hDim(y: number, xs: number[], labels: string[], reach: number): Mark[] {
  const marks: Mark[] = [{ t: 'line', k: 'dim', x1: xs[0] - 10, y1: y, x2: xs[xs.length - 1] + 10, y2: y }];
  for (const x of xs) {
    marks.push({ t: 'line', k: 'dim', x1: x, y1: y - 6, x2: x, y2: reach }, tick(x, y));
  }
  labels.forEach((s, i) => marks.push({ t: 'text', x: (xs[i] + xs[i + 1]) / 2, y: y - 7, s, anchor: 'middle' }));
  return marks;
}

const PLANS: Record<'retail' | 'restaurant' | 'core', { w: number; h: number; marks: Mark[] }> = {
  // A fashion unit: fitting rooms down one side, stockroom behind, shopfront
  // glazing to the mall corridor along the bottom.
  retail: {
    w: 560,
    h: 400,
    marks: [
      { t: 'rect', k: 'wall', x: 40, y: 70, w: 480, h: 9 },
      { t: 'rect', k: 'wall', x: 40, y: 70, w: 9, h: 280 },
      { t: 'rect', k: 'wall', x: 511, y: 70, w: 9, h: 280 },
      { t: 'rect', k: 'wall', x: 40, y: 341, w: 80, h: 9 },
      { t: 'rect', k: 'wall', x: 440, y: 341, w: 80, h: 9 },
      { t: 'rect', k: 'wall', x: 380, y: 79, w: 7, h: 110 },
      { t: 'rect', k: 'wall', x: 387, y: 182, w: 36, h: 7 },
      { t: 'rect', k: 'wall', x: 459, y: 182, w: 52, h: 7 },
      ...column(150, 120),
      ...column(150, 280),
      // Shopfront glazing and mullions.
      { t: 'line', k: 'fit', x1: 120, y1: 343, x2: 440, y2: 343 },
      { t: 'line', k: 'fit', x1: 120, y1: 348, x2: 440, y2: 348 },
      { t: 'line', k: 'fit', x1: 200, y1: 341, x2: 200, y2: 350 },
      { t: 'line', k: 'fit', x1: 360, y1: 341, x2: 360, y2: 350 },
      // Stockroom door, leaf and swing.
      { t: 'line', k: 'fit', x1: 459, y1: 185, x2: 459, y2: 149 },
      { t: 'path', k: 'fit', d: 'M459 149 A36 36 0 0 0 423 185' },
      // Entrance doors in the shopfront, a pair.
      { t: 'line', k: 'fit', x1: 250, y1: 346, x2: 250, y2: 310 },
      { t: 'path', k: 'fit', d: 'M250 310 A36 36 0 0 1 286 346' },
      { t: 'line', k: 'fit', x1: 322, y1: 346, x2: 322, y2: 310 },
      { t: 'path', k: 'fit', d: 'M322 310 A36 36 0 0 0 286 346' },
      // Fitting rooms, curtained.
      { t: 'line', k: 'fit', x1: 49, y1: 150, x2: 118, y2: 150 },
      { t: 'line', k: 'fit', x1: 49, y1: 210, x2: 118, y2: 210 },
      { t: 'line', k: 'fit', x1: 49, y1: 270, x2: 118, y2: 270 },
      { t: 'line', k: 'fit', x1: 118, y1: 150, x2: 118, y2: 270, dash: true },
      // Wall shelving, display tables, cash desk.
      { t: 'rect', k: 'furn', x: 190, y: 82, w: 180, h: 14 },
      { t: 'rect', k: 'furn', x: 210, y: 150, w: 70, h: 40 },
      { t: 'rect', k: 'furn', x: 210, y: 240, w: 70, h: 40 },
      { t: 'rect', k: 'furn', x: 400, y: 240, w: 80, h: 28, rx: 4 },
      // Mall corridor edge.
      { t: 'line', k: 'furn', x1: 10, y1: 378, x2: 550, y2: 378, dash: true },
      ...hDim(38, [40, 280, 520], ['6 000', '6 000'], 64),
    ],
  },

  // A restaurant: dining to the mall, kitchen behind a pass counter.
  restaurant: {
    w: 560,
    h: 400,
    marks: [
      { t: 'rect', k: 'wall', x: 40, y: 50, w: 480, h: 9 },
      { t: 'rect', k: 'wall', x: 40, y: 331, w: 480, h: 9 },
      { t: 'rect', k: 'wall', x: 511, y: 50, w: 9, h: 290 },
      { t: 'rect', k: 'wall', x: 40, y: 50, w: 9, h: 100 },
      { t: 'rect', k: 'wall', x: 40, y: 250, w: 9, h: 90 },
      { t: 'rect', k: 'wall', x: 360, y: 59, w: 7, h: 90 },
      { t: 'rect', k: 'wall', x: 360, y: 200, w: 7, h: 56 },
      { t: 'rect', k: 'wall', x: 360, y: 292, w: 7, h: 39 },
      ...column(200, 185),
      // Glazing to the mall.
      { t: 'line', k: 'fit', x1: 42, y1: 150, x2: 42, y2: 250 },
      { t: 'line', k: 'fit', x1: 47, y1: 150, x2: 47, y2: 250 },
      // Kitchen door.
      { t: 'line', k: 'fit', x1: 363, y1: 292, x2: 399, y2: 292 },
      { t: 'path', k: 'fit', d: 'M399 292 A36 36 0 0 0 363 256' },
      // Pass counter, cooking line, island.
      { t: 'rect', k: 'fit', x: 326, y: 149, w: 30, h: 51 },
      { t: 'rect', k: 'furn', x: 470, y: 70, w: 32, h: 240 },
      { t: 'line', k: 'furn', x1: 470, y1: 130, x2: 502, y2: 130 },
      { t: 'line', k: 'furn', x1: 470, y1: 190, x2: 502, y2: 190 },
      { t: 'line', k: 'furn', x1: 470, y1: 250, x2: 502, y2: 250 },
      { t: 'rect', k: 'furn', x: 400, y: 130, w: 40, h: 100 },
      // Dining: tables with a chair either side.
      ...[100, 180, 260].flatMap((x) =>
        [95, 265].flatMap<Mark>((y) => [
          { t: 'rect', k: 'furn', x, y, w: 30, h: 30 },
          { t: 'path', k: 'furn', d: `M${x + 5} ${y - 6} h20` },
          { t: 'path', k: 'furn', d: `M${x + 5} ${y + 36} h20` },
        ]),
      ),
      { t: 'circle', k: 'furn', cx: 280, cy: 200, r: 22 },
      ...hDim(372, [40, 360, 520], ['8 400', '4 200'], 346),
    ],
  },

  // A core: stair with its walk line and break, lift shaft crossed through.
  core: {
    w: 560,
    h: 400,
    marks: [
      { t: 'rect', k: 'wall', x: 60, y: 60, w: 300, h: 9 },
      { t: 'rect', k: 'wall', x: 60, y: 60, w: 9, h: 280 },
      { t: 'rect', k: 'wall', x: 60, y: 331, w: 190, h: 9 },
      { t: 'rect', k: 'wall', x: 200, y: 69, w: 7, h: 200 },
      { t: 'rect', k: 'wall', x: 351, y: 60, w: 9, h: 140 },
      { t: 'rect', k: 'wall', x: 207, y: 150, w: 144, h: 7 },
      // Stair: treads, centre wall, walk line with arrow, break line.
      ...Array.from({ length: 11 }, (_, i): Mark => ({
        t: 'line', k: 'fit', x1: 69, y1: 90 + i * 20, x2: 200, y2: 90 + i * 20,
      })),
      { t: 'line', k: 'fit', x1: 134, y1: 90, x2: 134, y2: 290 },
      { t: 'path', k: 'fit', d: 'M101 300 V100 H167 V300' },
      { t: 'path', k: 'fit', d: 'M161 290 L167 300 L173 290' },
      { t: 'path', k: 'fit', d: 'M69 250 L120 220 L126 232 L200 190' },
      // Lift shaft.
      { t: 'rect', k: 'fit', x: 222, y: 80, w: 110, h: 58 },
      { t: 'line', k: 'fit', x1: 222, y1: 80, x2: 332, y2: 138 },
      { t: 'line', k: 'fit', x1: 332, y1: 80, x2: 222, y2: 138 },
      // Lobby door.
      { t: 'line', k: 'fit', x1: 250, y1: 336, x2: 250, y2: 296 },
      { t: 'path', k: 'fit', d: 'M250 296 A40 40 0 0 1 290 336' },
      ...column(420, 180, 16),
      ...column(420, 320, 16),
      // Structural grid bubbles.
      { t: 'line', k: 'dim', x1: 428, y1: 30, x2: 428, y2: 380, dash: true },
      { t: 'circle', k: 'dim', cx: 428, cy: 18, r: 11 },
      { t: 'text', x: 428, y: 22, s: 'C', anchor: 'middle' },
      { t: 'line', k: 'dim', x1: 390, y1: 188, x2: 550, y2: 188, dash: true },
      { t: 'circle', k: 'dim', cx: 540, cy: 188, r: 11 },
      { t: 'text', x: 540, y: 192, s: '3', anchor: 'middle' },
      ...hDim(30, [60, 200, 360], ['2 800', '3 200'], 54),
    ],
  },
};

export type PlanName = keyof typeof PLANS;

const STROKE: Record<Kind, { width: number; color: string; opacity: number }> = {
  wall: { width: 1.4, color: 'var(--figure)', opacity: 0.55 },
  fit: { width: 1, color: 'var(--figure)', opacity: 0.42 },
  furn: { width: 0.8, color: 'var(--figure)', opacity: 0.3 },
  dim: { width: 0.8, color: 'var(--color-accent)', opacity: 0.8 },
};

const ORDER: Record<Kind, number> = { wall: 0, fit: 1, furn: 2, dim: 3 };

export function PlanDrawing({ name, className = '' }: { name: PlanName; className?: string }) {
  const plan = PLANS[name];

  // Stagger within each kind, and hold each kind back until the one before it
  // is mostly down — walls, then fit-out, then furniture, then dimensions.
  const seen: Record<Kind, number> = { wall: 0, fit: 0, furn: 0, dim: 0 };
  const delayFor = (k: Kind) => ORDER[k] * 420 + seen[k]++ * 45;

  return (
    <Reveal className={`plan-draw ${className}`}>
      <svg viewBox={`0 0 ${plan.w} ${plan.h}`} className="h-auto w-full overflow-visible" fill="none">
        {plan.marks.map((m, i) => {
          if (m.t === 'text') {
            return (
              <text
                key={i}
                x={m.x}
                y={m.y}
                textAnchor={m.anchor ?? 'start'}
                className="plan-label"
                fill="var(--color-accent)"
                style={{ fontSize: 9, letterSpacing: '0.08em' }}
              >
                {m.s}
              </text>
            );
          }

          const s = STROKE[m.k];
          const common = {
            stroke: s.color,
            strokeOpacity: s.opacity,
            strokeWidth: s.width,
            pathLength: 1,
            className: 'plan-stroke',
            style: { transitionDelay: `${delayFor(m.k)}ms` },
          };

          switch (m.t) {
            case 'rect':
              return <rect key={i} x={m.x} y={m.y} width={m.w} height={m.h} rx={m.rx} {...common} />;
            case 'line':
              return (
                <line
                  key={i}
                  x1={m.x1}
                  y1={m.y1}
                  x2={m.x2}
                  y2={m.y2}
                  {...common}
                  // A dashed line cannot also be drawn in by its dash array, so
                  // hidden lines fade in instead.
                  {...(m.dash ? { pathLength: undefined, strokeDasharray: '5 4', className: 'plan-fade' } : {})}
                />
              );
            case 'path':
              return <path key={i} d={m.d} {...common} />;
            case 'circle':
              return <circle key={i} cx={m.cx} cy={m.cy} r={m.r} {...common} />;
          }
        })}
      </svg>
    </Reveal>
  );
}
