import { PlanDrawing, type PlanName } from '@/components/ui/PlanDrawing';

/**
 * A section laid on a drawing sheet: its structural grid, and a fragment of
 * plan where the layout leaves room for one.
 *
 * The verticals sit inside `u-shell` on the same twelve tracks the content is
 * laid out on, so they are the page's own grid made visible rather than a
 * texture. They are labelled the way a structural grid is — letters along one
 * axis in bubbles, numbers along the other — at the foot of the section, which
 * keeps them clear of the fixed header on the page heroes.
 *
 * Pure CSS against --hairline and --figure, so it inverts with the section's
 * theme. The mask keeps the lines faint through the middle of the section,
 * where the text is.
 */

const LETTERS = 'ABCDEFGHJKLMN'; // I is skipped on drawings: it reads as 1.

/** Where the plan fragment sits, chosen per section to stay clear of its text. */
export type PlanPlacement = 'top-right' | 'bottom-left' | 'middle';

const PLACEMENT: Record<PlanPlacement, string> = {
  'top-right': 'right-[var(--gutter)] top-28',
  'bottom-left': 'bottom-24 left-[var(--gutter)]',
  middle: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function DraftingGrid({
  columns = 12,
  plan,
  planAt = 'top-right',
  mobilePlan = true,
  className = '',
}: {
  columns?: number;
  plan?: PlanName;
  planAt?: PlanPlacement;
  /** Show the plan under the content on phones. Off where the section already
   *  ends on an image and a drawing below it would be one too many. */
  mobilePlan?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            'linear-gradient(to bottom, rgb(0 0 0 / 0.9) 0%, rgb(0 0 0 / 0.3) 38%, rgb(0 0 0 / 0.3) 62%, rgb(0 0 0 / 1) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgb(0 0 0 / 0.9) 0%, rgb(0 0 0 / 0.3) 38%, rgb(0 0 0 / 0.3) 62%, rgb(0 0 0 / 1) 100%)',
        }}
      >
        {/* Horizontal grid lines, one per 320px of section height. */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0 319px, var(--hairline) 319px 320px)',
            backgroundPosition: '0 160px',
            opacity: 0.5,
          }}
        />

        {/* Their numbers, in bubbles in the left margin. */}
        <div className="absolute inset-y-0 left-0 hidden w-[var(--gutter)] md:block">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="plan-bubble absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: 160 + i * 320 }}
            >
              {i + 1}
            </span>
          ))}
        </div>

        <div className="u-shell h-full">
          <div className="relative grid h-full" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, i) => (
              <div
                key={i}
                className="relative border-l border-[var(--hairline)] last:border-r"
                style={{ borderLeftStyle: i % 3 === 0 ? 'solid' : 'dashed' }}
              >
                {/* Letters on every third line — the structural bays; the
                    lines between are setting-out, and go unlabelled. */}
                {i % 3 === 0 ? (
                  <span className="plan-bubble absolute bottom-6 left-0 hidden -translate-x-1/2 md:flex">
                    {LETTERS[i / 3]}
                  </span>
                ) : null}
              </div>
            ))}
            <span className="plan-bubble absolute bottom-6 right-0 hidden translate-x-1/2 md:flex">
              {LETTERS[columns / 3]}
            </span>
          </div>
        </div>
      </div>

      {plan ? (
        <>
          {/* Desktop: beside the text, in the space the layout leaves. */}
          <div className={`absolute hidden w-[min(31vw,28rem)] lg:block ${PLACEMENT[planAt]}`}>
            <PlanDrawing name={plan} />
          </div>

          {/* Phones: one column of text runs edge to edge, so there is no space
              beside it — only below it. The whole plan sits centred in the
              section's bottom padding, small enough to leave room: 15rem wide
              is about 171px tall, which with its offset needs the section to
              give phones pb-72 (288px) under its last line — about 85px clear.

              An earlier version showed only a 96px strip through the middle of
              the drawing, faded at both edges. Cut that way it read as a plan
              that failed to load rather than a deliberate crop.

              Not on tablets: the grid's letter bubbles sit in the same bottom
              band from md up, and the two would collide. */}
          {mobilePlan ? (
            <div className="absolute inset-x-0 bottom-8 flex justify-center md:hidden">
              <div className="w-60">
                <PlanDrawing name={plan} />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
