import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

/**
 * The client wall, as a ruled register rather than a marquee.
 *
 * WHY NOT A MARQUEE. Two logo rows sliding in opposite directions is the
 * default treatment, and it was what this used to be. Three things are wrong
 * with it here. It is the same gesture every competitor in this market uses, so
 * it says nothing about whose site you are on. It never shows the whole list at
 * once — the one thing a client wall exists to do is let someone find the name
 * they already trust, and a marquee makes that a waiting game. And it is
 * permanent motion on a page that already spends its motion budget on a
 * scroll-driven film.
 *
 * So the marks are plotted onto a drawing sheet instead: a ruled grid, every
 * cell referenced in its corner, the whole list legible at a glance. It is the
 * same language as the film's title block and the map's dropped pins, which is
 * the point — one studio, drawing on everything.
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
 * which is what makes a grid of unrelated logos read as one grid. Height is
 * then clamped at both ends: without the cap, a square mark would fill its cell
 * top to bottom; without the floor, the widest wordmark would thin to a smear.
 *
 * The painted box is additionally capped at the cell width. A 9:1 wordmark held
 * to the floor height is wider than a phone-width cell, and `contain` then
 * letterboxes it inside the box rather than distorting it — so the mark gets
 * smaller on a narrow screen instead of overflowing the rule.
 */
const AREA = 2704; // px², i.e. a 4:1 wordmark lands at 26px tall
const MIN_H = 18;
const MAX_H = 34;

/** `site` is `as const`, so `site.clients` is a tuple — slicing it needs the element type. */
type Client = (typeof site.clients)[number];

function Cell({ client, index }: { client: Client; index: number }) {
  const { name, file, w } = client;
  const aspect = w / 120;
  const height = Math.min(MAX_H, Math.max(MIN_H, Math.sqrt(AREA / aspect)));
  const mask = `url(/logos/${file}) no-repeat center / contain`;

  return (
    <Reveal
      as="li"
      // Plotted in reading order, a beat apart, so the sheet fills the way a
      // pen would fill it rather than all at once.
      delay={index * 45}
      // Fifteen is odd, so on two columns the last mark would sit alone in half
      // a row. Spanning it reads as the end of the sheet instead of a gap. Both
      // wider grids divide evenly, so the span is reset at the first of them.
      className="group relative flex min-h-[5.5rem] items-center justify-center bg-[var(--ground)] px-4 py-6 last:col-span-2 sm:last:col-span-1 md:min-h-[6.75rem]"
    >
      {/* Real text rather than an aria-label: the painted box is a masked
          background with no content of its own, and a list item with text in
          it survives translation and copy-paste in a way a label does not. */}
      <span className="sr-only">{name}</span>
      <span
        aria-hidden="true"
        className="absolute left-2.5 top-2.5 font-[family-name:var(--font-sans)] text-[0.5rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)] opacity-45 transition-colors duration-300 group-hover:text-[var(--color-accent)] group-hover:opacity-100"
      >
        C-{String(index + 1).padStart(2, '0')}
      </span>

      <span
        aria-hidden="true"
        className="block max-w-full opacity-55 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          width: `${height * aspect}px`,
          height: `${height}px`,
          backgroundColor: 'currentColor',
          mask,
          WebkitMask: mask,
        }}
      />
    </Reveal>
  );
}

export function TrustedBy() {
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

      <div className="u-shell pb-16 md:pb-20">
        {/* The rules are the 1px gaps showing the container through, which is
            what keeps them hairlines that never double up where cells meet.
            `p-px` extends the same trick to the outside edge. */}
        <ul className="grid grid-cols-2 gap-px bg-[var(--hairline)] p-px sm:grid-cols-3 lg:grid-cols-5">
          {site.clients.map((client, i) => (
            <Cell key={client.file} client={client} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
