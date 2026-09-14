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

// A bare chevron: two strokes meeting at an apex, no crossbar.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M8 94 L50 10 L92 94' fill='none' stroke='black' stroke-width='5.5' stroke-linecap='butt' stroke-linejoin='miter'/%3E%3C/svg%3E\")";

function ChevronA({ track }: { track: number }) {
  return (
    <span
      className="relative inline-block"
      style={{ marginInlineEnd: `${track}em`, width: '0.62em' }}
    >
      {/* The real character, kept in the text layer but not painted. */}
      <span style={{ color: 'transparent' }}>A</span>
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundColor: 'currentColor',
          maskImage: CHEVRON,
          WebkitMaskImage: CHEVRON,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          top: '0.14em',
          height: '0.7em',
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
            style={{ fontSize: `calc(${font} * 0.5)`, letterSpacing: '0.14em' }}
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
