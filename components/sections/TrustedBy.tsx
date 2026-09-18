import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

/**
 * The client wall.
 *
 * Every logo here is an alpha mask, not a picture: the source artwork's
 * darkness became its opacity, so the file carries shape and nothing else.
 * Painted with `background: currentColor` through a CSS mask, each mark then
 * inherits whatever ink the section it sits in is using — which is the only
 * way a single set of files can work on both the paper and the ink grounds
 * this site alternates between. It is the same substitution Wordmark.tsx makes
 * for the chevron A.
 *
 * A colour logo wall would also be the one place on this site where fifteen
 * unrelated brand palettes shout at once. One ink keeps the studio's voice.
 *
 * Two rows scrolling in opposite directions, duplicated once so the loop has
 * no seam. The marquee is decorative motion — the list underneath is real,
 * ordered text, and under reduced motion it simply stops and wraps.
 */

/**
 * Optical sizing.
 *
 * Every mask was written out 120px tall, so setting a common height is the
 * obvious move and the wrong one: it makes a 9:1 wordmark like JACK&JONES
 * enormous and a near-square mark like Sahara Centre's a speck, because the eye
 * reads a logo's size as its area, not its height.
 *
 * So each mark is scaled to a constant area instead — h = √(AREA / aspect) —
 * which is what makes a row of unrelated logos read as one row. Height is then
 * clamped at both ends: without the cap, a square mark would be half as tall
 * again as the row it sits in; without the floor, the widest wordmark would
 * thin to a smear.
 */
const AREA = 2704; // px², i.e. a 4:1 wordmark lands at 26px tall
const MIN_H = 18;
const MAX_H = 34;

/** `site` is `as const`, so `site.clients` is a tuple — slicing it needs the element type. */
type Client = (typeof site.clients)[number];

function Mark({ name, file, w }: { name: string; file: string; w: number }) {
  const aspect = w / 120;
  const height = Math.min(MAX_H, Math.max(MIN_H, Math.sqrt(AREA / aspect)));
  const mask = `url(/logos/${file}) no-repeat center / contain`;

  return (
    <li
      className="flex shrink-0 items-center px-[clamp(1.5rem,4vw,3.5rem)]"
      // The accessible name lives on the <li>, because the painted box is a
      // masked background with no content of its own.
      aria-label={name}
    >
      <span
        aria-hidden="true"
        className="block opacity-55 transition-opacity duration-500 hover:opacity-100"
        style={{
          width: `${height * aspect}px`,
          height: `${height}px`,
          backgroundColor: 'currentColor',
          mask,
          WebkitMask: mask,
        }}
      />
    </li>
  );
}

function Row({
  items,
  reverse = false,
}: {
  items: readonly Client[];
  reverse?: boolean;
}) {
  return (
    <div className="logo-row relative flex overflow-hidden" data-reverse={reverse || undefined}>
      {/* The second copy is aria-hidden: it is the same list again, purely so
          the translation can wrap at -50% without a gap. */}
      {[false, true].map((duplicate) => (
        // `shrink-0`: the row is a flex container, so without it the two
        // tracks shrink to share the viewport and every mark lands on top of
        // its neighbour instead of running off the edge.
        <ul
          key={String(duplicate)}
          className="logo-track flex w-max shrink-0 items-center py-5"
          aria-hidden={duplicate || undefined}
        >
          {items.map((client) => (
            <Mark key={client.file} {...client} />
          ))}
        </ul>
      ))}
    </div>
  );
}

export function TrustedBy() {
  const half = Math.ceil(site.clients.length / 2);

  return (
    <section
      data-theme="light"
      className="border-y border-[var(--hairline)] bg-[var(--ground)] text-[var(--figure)]"
    >
      <div className="u-shell py-16 md:py-20">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className="u-label">Trusted by</p>
          <p className="text-[0.8125rem] text-[var(--muted)]">
            Landlords, mall operators and the brands whose units we draw.
          </p>
        </Reveal>
      </div>

      <Reveal delay={90} className="pb-14 md:pb-16">
        {/* Masked edges, so marks arrive and leave rather than being clipped. */}
        <div
          className="[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
        >
          <Row items={site.clients.slice(0, half)} />
          <Row items={site.clients.slice(half)} reverse />
        </div>
      </Reveal>
    </section>
  );
}
