import { site } from '@/lib/site';

/**
 * The MENAARC wordmark.
 *
 * The distinguishing feature is the crossbar-less "A" — a bare chevron. No
 * shipping typeface has that glyph.
 *
 * The two A's are therefore real text characters, made transparent, with the
 * chevron painted over them by a CSS mask in `currentColor`. Drawing them as
 * aria-hidden `<svg>` instead left the mark spelling "MENRC" in the DOM, which
 * breaks WCAG 2.5.3 (Label in Name): a voice-control user saying "MENAARC"
 * would not match the link. Keeping the letters as text means the accessible
 * name, the copied text and the search-indexed text all read correctly, and
 * only the pixels are substituted.
 *
 * Tracking is applied twice — as letter-spacing for the characters, and as an
 * explicit margin on the chevrons, because browsers do not apply letter-spacing
 * around a masked inline box.
 */

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { font: string; track: number }> = {
  sm: { font: '0.9rem', track: 0.42 },
  md: { font: '1.35rem', track: 0.44 },
  lg: { font: 'clamp(1.75rem, 5.5vw, 4.25rem)', track: 0.38 },
};

/**
 * Chevron geometry, in units where 100 = the glyph's cap height.
 *
 * The viewBox aspect must match the box it is masked into, or the non-uniform
 * squash makes the stroke thicker vertically than horizontally — an earlier
 * version used a square viewBox in a 0.62 x 0.70em box and the legs were
 * visibly uneven.
 */
const CAP = 100; // cap height
const HALF_WIDTH = 44; // half the glyph's advance, so the box is 88 x 100
// Tuned by measuring a 400px render: the letter stems come out at 31-32px, and
// this puts the chevron's perpendicular stroke at ~30.5px. Deliberately a hair
// under, because a diagonal at the same measured width reads heavier than a
// vertical stem. The first version used 5.5 in a square viewBox, which landed
// at 13.7px — under half the weight of the letters beside it.
const STROKE = 11.35;

const CHEVRON_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${HALF_WIDTH * 2} ${CAP}'>` +
  `<path d='M0 ${CAP} L${HALF_WIDTH} 0 L${HALF_WIDTH * 2} ${CAP}' fill='none' stroke='black'` +
  ` stroke-width='${STROKE}' stroke-linecap='butt' stroke-linejoin='miter'/></svg>`;

const CHEVRON = `url("data:image/svg+xml,${encodeURIComponent(CHEVRON_SVG)}")`;

/**
 * Archivo's real vertical metrics, measured rather than assumed.
 *
 * Rendering the mark at 400px and scanning the M's left stem puts its cap line
 * at row 59 and its baseline at row 333. So the cap height is 274/400 and the
 * baseline sits 333/400 down the 1em line box (leading-none). Earlier guesses
 * of 0.73 and 0.87 stood the chevron ~6px proud of the cap line and dropped its
 * feet ~15px below the baseline.
 */
const CAP_HEIGHT_EM = 274 / 400;
const BASELINE_EM = 333 / 400;
const CHEVRON_WIDTH_EM = (CAP_HEIGHT_EM * HALF_WIDTH * 2) / CAP;

function ChevronA({ track }: { track: number }) {
  return (
    <span
      className="relative inline-block"
      style={{ marginInlineEnd: `${track}em`, width: `${CHEVRON_WIDTH_EM}em` }}
    >
      {/* The real character, kept in the text layer but not painted. */}
      <span style={{ color: 'transparent' }}>A</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0"
        style={{
          backgroundColor: 'currentColor',
          maskImage: CHEVRON,
          WebkitMaskImage: CHEVRON,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          // Positioned from the top of the 1em line box, not from `bottom`:
          // the box extends below the baseline by the font's descender, so
          // bottom-aligning would drop the chevron below the other letters.
          // With leading-none the baseline sits at BASELINE_EM from the top.
          top: `${BASELINE_EM - CAP_HEIGHT_EM}em`,
          height: `${CAP_HEIGHT_EM}em`,
        }}
      />
    </span>
  );
}

export function Wordmark({
  size = 'md',
  withArabic = false,
  className = '',
}: {
  size?: Size;
  withArabic?: boolean;
  className?: string;
}) {
  const { font, track } = SIZES[size];
  // MENAARC — positions 3 and 4 are the chevrons.
  const letters = ['M', 'E', 'N', 'A', 'A', 'R', 'C'];

  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <span
        className="inline-flex items-baseline font-light leading-none"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: font,
          letterSpacing: `${track}em`,
        }}
      >
        {letters.map((char, i) =>
          char === 'A' ? <ChevronA key={i} track={track} /> : <span key={i}>{char}</span>,
        )}
      </span>

      {withArabic ? (
        <span className="mt-[0.6em] flex w-full items-center gap-[0.6em] self-stretch">
          <span aria-hidden="true" className="h-px flex-1 bg-current opacity-40" />
          <span
            className="u-arabic whitespace-nowrap font-light"
            style={{ fontSize: `max(0.8125rem, calc(${font} * 0.55))`, letterSpacing: '0.14em' }}
            lang="ar"
          >
            {site.nameArabic}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-current opacity-40" />
        </span>
      ) : null}
    </span>
  );
}
