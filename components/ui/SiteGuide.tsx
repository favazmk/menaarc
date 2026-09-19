'use client';

import { useEffect, useRef, useState } from 'react';
import { GuideMascot } from './GuideMascot';

/**
 * A small building that follows you down the home page.
 *
 * This used to be a drawn architect in the same hairline as the floor plans
 * behind the sections, on the argument that a rendered mascot would be the one
 * object on the site that is neither a photograph of something built nor a
 * drawing of something proposed. That argument lost to a better one: the studio
 * draws buildings, so the guide is a building. It is the subject with a face on
 * it rather than a stock character borrowed to stand next to the subject.
 *
 * The cost of the swap is real and worth naming. Linework re-inked itself
 * through `currentColor` as it crossed between the page's light and dark
 * grounds; a rendered figure cannot, and its darkest parts — the limbs — sit
 * close enough to the ink ground to disappear into it. A light halo keyed off
 * the mirrored theme is what buys the silhouette back (see .site-guide in
 * globals.css), and it is the reason this file still tracks the ground it is
 * standing on even though nothing recolours any more.
 *
 * What it does:
 *  - appears only once the film has been scrolled past, because the film is a
 *    held shot and nothing should fly across it;
 *  - rises and settles to a new height as each section takes the viewport,
 *    holding the bottom-left corner the whole way down;
 *  - says one line about the section you are actually looking at when tapped.
 *
 * It is a real <button> with real text in the bubble, so the lines are
 * available to a screen reader and to search, and it can be dismissed for
 * good. Under reduced motion it stops travelling and bobbing and simply sits
 * in the corner — still tappable, still saying the right line.
 */

type Stop = {
  /** Matches `data-guide` on the section. */
  id: string;
  /** One line about that section, in the studio's voice. */
  says: string;
  /**
   * Distance above the bottom edge, in rem.
   *
   * Varies so its path down the page is not a straight line, but stays inside
   * the band near the viewport's bottom edge where floating UI belongs. An
   * earlier set ran up to 12rem and parked it in the middle of a definition
   * list, knocking out the term behind it.
   */
  /**
   * Which gutter it hugs on this section.
   *
   * Chosen against that section's own layout: the map hero puts its copy left,
   * the work list puts its photographs right, and the guide takes whichever
   * side the section leaves empty. This is the whole of the "do not sit on the
   * content" rule — the runtime check further down is a backstop, not the plan.
   */
  side: 'left' | 'right';
  /**
   * Where it sits vertically, as a fraction of the viewport. 0 is the top edge,
   * 1 the bottom. Clamped in CSS so it can never reach either.
   */
  y: number;
};

/**
 * Its route, in page order — see app/page.tsx for why the page runs this way.
 *
 * It holds the bottom-left corner throughout and only its height changes, so
 * `lift` cycles through three values to keep the path from being a straight
 * slide down one edge. That cycle has to be re-walked if the sections are
 * reordered, and so does any line that refers to the section before or after
 * it.
 */
const STOPS: Stop[] = [
  {
    id: 'clients',
    says: 'Mall operators let us on site. Brands let us draw their units. In this business you need both.',
    side: 'left',
    y: 0.84,
  },
  {
    id: 'region',
    says: 'The filled markers are places with a finished project in them — somewhere you could go and stand.',
    side: 'right',
    y: 0.26,
  },
  {
    id: 'stats',
    says: 'Six years, and that many projects, out of one office. What it looks like is the next thing down.',
    side: 'right',
    y: 0.72,
  },
  {
    id: 'work',
    says: 'Every photograph here is a finished unit. There is not one render on this page.',
    side: 'left',
    y: 0.34,
  },
  {
    id: 'studio',
    says: 'Everything from the first sketch to the site walk happens in this office. Nothing gets handed over.',
    side: 'right',
    y: 0.8,
  },
  {
    id: 'services',
    says: 'Concept, detailed drawings, authority approvals, MEP, project management. Five things, one roof.',
    side: 'left',
    y: 0.24,
  },
  {
    id: 'process',
    says: 'A mall lease date does not move. So the programme is the first thing we draw, before the plan.',
    side: 'right',
    y: 0.38,
  },
  {
    id: 'contact',
    says: 'Send a message and you reach the studio, not a form queue. Usually the same day.',
    side: 'left',
    y: 0.82,
  },
];

const BY_ID = new Map(STOPS.map((s) => [s.id, s]));

/**
 * Above this much of a section being visible, the guide stops roaming and
 * settles into the bottom-left corner — "a full section has appeared". Below
 * it, the section is only partly on screen and the guide takes that section's
 * own perch, which is what makes it read as flying about the page.
 */
const SETTLED_RATIO = 0.96;

/** Where it settles once a section is fully in view. */
const SETTLED: { side: 'left'; y: number } = { side: 'left', y: 0.86 };

export function SiteGuide() {
  const [stop, setStop] = useState<Stop | null>(null);
  /**
   * The ground of the section it is currently over.
   *
   * It is `position: fixed`, so it sits outside every `[data-theme]` scope
   * and would otherwise be stuck with the root's paper ground — a white disc
   * punched through the ink sections. Mirroring the active section's theme onto
   * its own root re-runs the same variable switch the sections use, so it
   * takes on the page's ground as it travels across the page.
   */
  const [theme, setTheme] = useState<string | null>(null);
  /** True once the active section is essentially all on screen. */
  const [settled, setSettled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Which stop's line is currently showing, rather than a plain `open` flag.
   *
   * Scrolling to a new section has to close the bubble — otherwise it is left
   * holding up the previous section's line. Keyed by id, that falls out of the
   * render: the bubble is open only while the stored id is still the stop the
   * observer is reporting. A boolean would need an effect to clear it, which is
   * the cascading-render pattern this codebase avoids everywhere else.
   */
  const [openFor, setOpenFor] = useState<string | null>(null);

  /**
   * Waves on landing.
   *
   * Set straight on the node rather than held in state: it is a flag CSS reads
   * for a second and a half, nothing else in the component branches on it, and
   * a render per arrival to carry a boolean that only ever reaches a stylesheet
   * would be a render for nothing.
   *
   * Adding the attribute is what starts the animation — the rule does not exist
   * until the attribute does, so each arrival runs it from the top instead of
   * joining one already in progress.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !stop) return;
    el.setAttribute('data-arriving', 'true');
    const timer = window.setTimeout(() => el.removeAttribute('data-arriving'), 1600);
    return () => {
      window.clearTimeout(timer);
      el.removeAttribute('data-arriving');
    };
  }, [stop]);

  /**
   * An open note closes itself.
   *
   * Two ways out, both of which people try before they look for a button: they
   * scroll on, or they touch something else. Wiring both is why there is no
   * dismiss control any more — the note is a thing you peek at, not a panel you
   * have to manage.
   *
   * `pointerdown` rather than `click`, so it closes on the press rather than
   * waiting for the release, and the guide's own subtree is exempt or the press
   * that opens it would immediately close it again.
   */
  useEffect(() => {
    if (!openFor) return;

    const close = () => setOpenFor(null);
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && root.contains(event.target)) return;
      close();
    };

    window.addEventListener('scroll', close, { passive: true });
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', close);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openFor]);

  /**
   * The backstop: if it lands on something, get off it.
   *
   * The perches are authored against each section's layout, which handles the
   * ordinary case. What it cannot know is the viewport — a narrow desktop
   * window pulls the content out to meet the gutter, and a perch that was clear
   * at 1600px is sitting on a paragraph at 1100px.
   *
   * So once the travel has settled, read what is actually underneath. The
   * guide's own root is `pointer-events: none`, so `elementFromPoint` reports
   * the page beneath it rather than the guide itself, which is what makes this
   * a two-line check instead of a geometry engine. If the middle of the figure
   * is over something with its own text, nudge the perch down towards the foot
   * of the viewport, where sections keep their whitespace.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const timer = window.setTimeout(() => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(
        Math.round(box.left + box.width / 2),
        Math.round(box.top + box.height / 2),
      );
      if (!hit || el.contains(hit)) return;

      /*
       * Only real content is worth dodging.
       *
       * The obvious test — does the thing underneath have text — is wrong, and
       * wrong in the direction that makes the feature useless: `textContent`
       * returns every descendant's text, so a hit on a section wrapper reports
       * the whole section and the guide decides it is covering something no
       * matter where it stands. It nudged on all eight stops.
       *
       * Asking whether the point is inside an actual content element instead
       * distinguishes the two cases properly: landing on a `<section>` or a
       * layout `<div>` means landing on that section's whitespace, which is
       * exactly where the guide belongs.
       */
      const occupied = Boolean(
        hit.closest('p, h1, h2, h3, h4, h5, li, a, button, input, textarea, label, img, svg, canvas, video, picture, figure'),
      );
      el.toggleAttribute('data-nudged', occupied);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
      el.removeAttribute('data-nudged');
    };
  }, [stop, settled]);

  // Which section holds the viewport. Most-visible wins rather than first-seen,
  // so a short section sandwiched between two tall ones still gets its turn.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-guide]');
    if (!targets.length) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.guide;
          if (id) ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: string | null = null;
        let best = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > best) {
            best = ratio;
            bestId = id;
          }
        }

        const next = bestId ? (BY_ID.get(bestId) ?? null) : null;
        setStop(next);
        setSettled(best >= SETTLED_RATIO);

        const section = bestId
          ? document
              .querySelector(`[data-guide="${bestId}"]`)
              ?.querySelector<HTMLElement>('[data-theme]')
          : null;
        setTheme(section?.dataset.theme ?? null);
      },
      // A ladder of thresholds: a section taller than the viewport never
      // crosses a high one, and one shorter than it never crosses a low one.
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!stop) return null;

  const open = openFor === stop.id;
  // Roaming while a section is only part-way on; parked once it is all there.
  const perch = settled ? SETTLED : stop;

  return (
    <div
      ref={rootRef}
      className="site-guide"
      data-theme={theme ?? undefined}
      data-open={open || undefined}
      data-side={perch.side}
      style={{ '--guide-y': String(perch.y) } as React.CSSProperties}
    >
      <p className="site-guide__bubble" role="status">
        {stop.says}
      </p>

      <button
        type="button"
        className="site-guide__button"
        aria-expanded={open}
        onClick={() => setOpenFor(open ? null : stop.id)}
      >
        <span className="sr-only">
          {open ? 'Hide the note about this section' : 'A note about this section'}
        </span>
        <span aria-hidden="true" className="site-guide__shadow" />
        <GuideMascot className="site-guide__figure" />
      </button>
    </div>
  );
}
