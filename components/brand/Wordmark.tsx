import { site } from '@/lib/site';

/**
 * The MENAARC wordmark, drawn rather than typeset.
 *
 * The mark is not set in any shipping typeface. Its letters are squared
 * geometric forms — a C with flat cut terminals, an R with a rounded-rectangle
 * bowl, an E whose spine turns through a radius — and the A is a bare chevron
 * with no crossbar at all. An earlier version set it in Archivo Light with only
 * the A substituted, which got three things wrong at once: the letterforms were
 * a grotesque rather than a squared geometric, the weight was Light where the
 * artwork is closer to Medium, and the chevron was drawn at 0.88 of its height
 * when the real one is 1.15 — noticeably too narrow.
 *
 * So every glyph here is a path, measured off the supplied artwork:
 *
 *   cap height          40px            -> 100 units
 *   stroke              6.5px           -> 16.25 units
 *   ink widths          M 49  E 37  N 42  A 46  R 38  C 37
 *   letter gaps         ~29.5px         -> 73.75 units
 *
 * Everything below is in those units, so the mark is resolution-independent and
 * the tracking can no longer drift with a font update.
 *
 * ACCESSIBILITY — the painted mark is aria-hidden and the word is carried by a
 * visually-hidden text node beside it. That keeps the accessible name, the
 * copied text and the indexed text all reading "MENAARC", which matters for
 * WCAG 2.5.3 (Label in Name): a voice-control user saying "MENAARC" has to be
 * able to match the link. Drawing the letters as bare SVG with no text at all
 * would leave the mark spelling nothing.
 */

type Size = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Cap heights, not font sizes — the mark is artwork now.
 *
 * The values are the previous font sizes multiplied by Archivo's cap ratio
 * (0.685), so the mark occupies exactly the space on the page it did before.
 */
const SIZES: Record<Size, string> = {
  sm: '0.62rem',
  md: '0.93rem',
  lg: 'clamp(1.2rem, 3.77vw, 2.91rem)',
  /** The brand statement under the home film. */
  xl: 'clamp(2.1rem, 8vw, 5.5rem)',
};

const CAP = 100;
/**
 * Measured by integrating ink coverage across a stroke rather than counting
 * thresholded pixels: the artwork is only 40px tall, so a hard threshold rounds
 * a 6.5px stroke up to 7 and the mark comes out visibly heavy. Coverage is
 * immune to the antialiasing halo.
 */
const STROKE = 16.25;
const GAP = 73.75;

/** Ink width of each glyph, and its paths in local coordinates. */
type Glyph = { w: number; d: string[] };

const H = STROKE / 2; // half-stroke: how far a centreline sits inside the ink

const GLYPHS: Glyph[] = [
  // M — two stems and a V that drops almost to the baseline.
  {
    w: 122.5,
    d: [`M${H} 0V${CAP}`, `M${122.5 - H} 0V${CAP}`, `M${H} 0L61.25 90L${122.5 - H} 0`],
  },
  // E — three arms off a spine that turns through a radius at both ends.
  {
    w: 92.5,
    d: [
      `M92.5 ${H}H21.25A12.5 12.5 0 0 0 ${H} 21.25V78.75A12.5 12.5 0 0 0 21.25 ${CAP - H}H92.5`,
      `M${H} 48.75H85`,
    ],
  },
  // N
  {
    w: 105,
    d: [`M${H} 0V${CAP}`, `M${105 - H} 0V${CAP}`, `M${H} 0L${105 - H} ${CAP}`],
  },
  // A — the bare chevron. Its apex and feet are cut flat by the frame, which is
  // exactly how the artwork reads: 7px of flat ink at the cap line.
  { w: 115, d: ['M7.9 100L57.5 0L107.1 100'] },
  { w: 115, d: ['M7.9 100L57.5 0L107.1 100'] },
  // R — stem, a rounded-rectangle bowl, and a straight leg out of its corner.
  {
    w: 95,
    d: [
      `M${H} 0V${CAP}`,
      `M${H} ${H}H76.25A10 10 0 0 1 86.25 18.75V41.25A10 10 0 0 1 76.25 51.25H${H}`,
      'M53.5 52.5L87.6 100',
    ],
  },
  // C — a squared C: flat bars top and bottom, vertical cut terminals.
  {
    w: 92.5,
    d: [
      `M92.5 ${H}H24.75A16 16 0 0 0 ${H} 24.75V75.25A16 16 0 0 0 24.75 ${CAP - H}H92.5`,
    ],
  },
];

/** Lay the glyphs out left to right with one gap between each pair. */
const LAYOUT = GLYPHS.reduce<{ x: number; items: { x: number; g: Glyph }[] }>(
  (acc, g) => {
    acc.items.push({ x: acc.x, g });
    acc.x += g.w + GAP;
    return acc;
  },
  { x: 0, items: [] },
);

const TOTAL_W = LAYOUT.x - GAP;
const ASPECT = TOTAL_W / CAP;

/**
 * How wide the Arabic lockup sits under the Latin, as a fraction of the mark.
 * Measured: the rules run 463–812 under a Latin that runs 405–877, so the lower
 * line is 74% of the upper one and centred on it — not full-bleed.
 */
const ARABIC_WIDTH = 0.74;

export function Wordmark({
  size = 'md',
  withArabic = false,
  className = '',
}: {
  size?: Size;
  withArabic?: boolean;
  className?: string;
}) {
  const cap = SIZES[size];

  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <span className="sr-only">{site.name}</span>

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${TOTAL_W} ${CAP}`}
        // The frame clips: the chevron's apex and the M's V are cut flat at the
        // cap line in the artwork, and a butt cap on a diagonal overshoots it.
        style={{ height: cap, width: `calc(${cap} * ${ASPECT})`, display: 'block' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        {LAYOUT.items.map(({ x, g }, i) => (
          <g key={i} transform={`translate(${x} 0)`}>
            {g.d.map((d, j) => (
              <path key={j} d={d} />
            ))}
          </g>
        ))}
      </svg>

      {withArabic ? (
        <span
          className="flex items-center"
          style={{ width: `calc(${cap} * ${ASPECT} * ${ARABIC_WIDTH})`, marginTop: `calc(${cap} * 0.42)` }}
        >
          <span aria-hidden="true" className="h-px flex-1 bg-current opacity-40" />
          {/* No letter-spacing: Arabic joins, and spacing it severs the joins the
              artwork draws as one continuous baseline. The airiness is kashida,
              built into `nameArabicLockup` — see lib/site.ts. Weight 500 because
              the artwork's Arabic carries the same stroke-to-height ratio as its
              Latin (0.17), which is a Medium, not the Light this used to use. */}
          <span
            className="u-arabic whitespace-nowrap"
            style={{
              fontSize: `max(0.75rem, calc(${cap} * 0.75))`,
              fontWeight: 500,
              marginInline: `calc(${cap} * 0.3)`,
            }}
            lang="ar"
          >
            {site.nameArabicLockup}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-current opacity-40" />
        </span>
      ) : null}
    </span>
  );
}
