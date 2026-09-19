'use client';

import { useEffect, useState } from 'react';

/**
 * A small site architect who follows you down the home page.
 *
 * She is drawn, not rendered: hairline strokes on nothing, the same ink and the
 * same line weight as the floor plans behind the sections. A shaded 3-D mascot
 * would be the one object on this site that is neither a photograph of
 * something built nor a drawing of something proposed, and it would look
 * borrowed. A figure in 0.9pt linework is the studio's own hand.
 *
 * What she does:
 *  - appears only once the film has been scrolled past, because the film is a
 *    held shot and nothing should fly across it;
 *  - moves to a new corner as each section takes the viewport, alternating
 *    sides so she never settles into being furniture;
 *  - says one line about the section you are actually looking at when tapped.
 *
 * She is a real <button> with real text in the bubble, so the lines are
 * available to a screen reader and to search, and she can be dismissed for
 * good. Under reduced motion she stops travelling and bobbing and simply sits
 * in the corner — still tappable, still saying the right line.
 */

type Stop = {
  /** Matches `data-guide` on the section. */
  id: string;
  /** One line about that section, in the studio's voice. */
  says: string;
  /** Which corner she flies to while that section holds the viewport. */
  side: 'left' | 'right';
  /**
   * Distance above the bottom edge, in rem.
   *
   * Varies so her path down the page is not a straight line, but stays inside
   * the band near the viewport's bottom edge where floating UI belongs. An
   * earlier set ran up to 12rem and parked her in the middle of a definition
   * list, knocking out the term behind her.
   */
  lift: number;
};

/**
 * Her route, in page order — see app/page.tsx for why the page runs this way.
 *
 * `side` alternates strictly so she crosses the page as you scroll rather than
 * hugging one edge, and `lift` cycles through three heights so the path is not
 * a straight line. Both have to be re-walked if the sections are reordered.
 */
const STOPS: Stop[] = [
  {
    id: 'clients',
    says: 'Mall operators let us on site. Brands let us draw their units. In this business you need both.',
    side: 'right',
    lift: 2.5,
  },
  {
    id: 'region',
    says: 'The filled markers are places with a finished project in them — somewhere you could go and stand.',
    side: 'left',
    lift: 4.5,
  },
  {
    id: 'stats',
    says: 'Six years, and that many projects, out of one office. What it looks like is the next thing down.',
    side: 'right',
    lift: 6.5,
  },
  {
    id: 'work',
    says: 'Every photograph here is a finished unit. There is not one render on this page.',
    side: 'left',
    lift: 2.5,
  },
  {
    id: 'studio',
    says: 'Everything from the first sketch to the site walk happens in this office. Nothing gets handed over.',
    side: 'right',
    lift: 4.5,
  },
  {
    id: 'services',
    says: 'Concept, detailed drawings, authority approvals, MEP, project management. Five things, one roof.',
    side: 'left',
    lift: 6.5,
  },
  {
    id: 'process',
    says: 'A mall lease date does not move. So the programme is the first thing we draw, before the plan.',
    side: 'right',
    lift: 2.5,
  },
  {
    id: 'contact',
    says: 'Send a message and you reach the studio, not a form queue. Usually the same day.',
    side: 'left',
    lift: 4.5,
  },
];

const BY_ID = new Map(STOPS.map((s) => [s.id, s]));

/**
 * The guide herself.
 *
 * Drawn at 120 x 184 and rendered around 72px tall, which is the constraint
 * that decides everything: at that size hairline detail disappears and only
 * silhouette, proportion and weight survive. So she is built from closed shapes
 * filled with the page's own ground and drawn over — a coat with a real hem and
 * lapel, sleeves that come out from under the shoulders, a helmet whose brim
 * overhangs the head by about a third of its width, a roll of drawings clamped
 * under one arm.
 *
 * Two earlier versions failed here and both failures were proportion, not
 * detail: the first was open single-weight strokes and read as a stick figure;
 * the second gave the helmet a brim half as wide again as her shoulders, which
 * turned it into a sun hat.
 *
 * Fills are `var(--ground)` where paper should show through and currentColor at
 * low opacity for the two things that are genuinely solid objects — the helmet
 * and the boots — so she re-inks herself as she crosses between the page's
 * light and dark sections without a second copy of the artwork.
 */
function Architect() {
  const ink = 'currentColor';
  const paper = 'var(--ground)';
  return (
    <svg viewBox="0 0 120 184" className="site-guide__figure" aria-hidden="true">
      <defs>
        <radialGradient id="guide-shadow">
          <stop offset="0%" stopColor={ink} stopOpacity="0.3" />
          <stop offset="100%" stopColor={ink} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* She hovers, so the contact shadow is the only thing telling you there
          is a ground at all. */}
      <ellipse cx="60" cy="176" rx="30" ry="5.5" fill="url(#guide-shadow)" />

      <g stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        {/* ---- the roll of drawings, behind the arm that clamps it ---- */}
        <g className="guide-roll" transform="rotate(19 28 110)">
          <rect x="20" y="84" width="15" height="52" rx="7.5" fill={ink} fillOpacity={0.14} />
          <ellipse cx="27.5" cy="84" rx="7.5" ry="3.2" fill={paper} strokeWidth={2.6} />
          <path d="M24 89 V131" strokeWidth={1.6} strokeOpacity={0.45} />
        </g>

        {/* ---- legs, then boots ---- */}
        <path d="M46 112 L44.5 158 H56 L56.5 112 Z" fill={paper} />
        <path d="M63.5 112 L64 158 H75.5 L74 112 Z" fill={paper} />
        <path
          d="M43.5 155 H57 v6 h4.5 q3.5 0 3.5 3.5 v1.5 H43.5 Z"
          fill={ink}
          fillOpacity={0.24}
        />
        <path
          d="M63 155 H76.5 v6 H81 q3.5 0 3.5 3.5 v1.5 H63 Z"
          fill={ink}
          fillOpacity={0.24}
        />

        {/* ---- the coat ---- */}
        <path
          d="M38 78 C38 67.5 44.5 61 52.5 58.5 L60 66 L67.5 58.5 C75.5 61 82 67.5 82 78 L85 120 H35 Z"
          fill={paper}
        />
        {/* The lapel and the placket are the two lines that make a shape a coat. */}
        <path d="M52.5 58.5 L60 66 L67.5 58.5" strokeWidth={2.6} fill="none" />
        <path d="M60 66 V118" strokeWidth={2} fill="none" />
        <path d="M42 98 H52.5" strokeWidth={2.2} fill="none" />
        <path d="M67.5 98 H78" strokeWidth={2.2} fill="none" />
        {/* A pencil in the pocket, which is the one detail that says what she
            does rather than where she is standing. */}
        <path d="M72.5 97 V84" strokeWidth={2.8} fill="none" />

        {/* ---- sleeves and hands ---- */}
        <path
          d="M39 79 C35 89 33.5 100 34.5 111 L45 111 C44.5 100 45 89 47 79 Z"
          fill={paper}
          strokeWidth={3.2}
        />
        <ellipse cx="39.5" cy="116" rx="5.5" ry="6" fill={paper} strokeWidth={3} />
        {/* The other arm is the one that does the pointing. */}
        <g className="guide-wave">
          <path
            d="M81 79 C85 89 86.5 100 85.5 111 L75 111 C75.5 100 75 89 73 79 Z"
            fill={paper}
            strokeWidth={3.2}
          />
          <ellipse cx="80.5" cy="116" rx="5.5" ry="6" fill={paper} strokeWidth={3} />
        </g>

        {/* ---- neck and head ---- */}
        <path d="M54.5 50 V59" strokeWidth={2.8} fill="none" />
        <path d="M65.5 50 V59" strokeWidth={2.8} fill="none" />
        <path
          d="M48.5 30 v12 c0 6.5 5.2 11.5 11.5 11.5 S71.5 48.5 71.5 42 V30 Z"
          fill={paper}
          strokeWidth={3.2}
        />
        {/* An ear — most of what makes a head read as a head at three-quarters. */}
        <path d="M48 38.5 a3.2 3.8 0 1 0 0.4 -6.6" fill={paper} strokeWidth={2.2} />

        {/* Eyes as arcs rather than dots: friendlier, and still legible at 8px. */}
        <path className="guide-eye" d="M53.4 38 q2.3 -2.5 4.6 0" strokeWidth={2.6} fill="none" />
        <path className="guide-eye" d="M62 38 q2.3 -2.5 4.6 0" strokeWidth={2.6} fill="none" />
        <path d="M60 40.5 v3.2 q0 1.4 1.4 1.4" strokeWidth={2} fill="none" />
        <path d="M56.4 47.5 q3.6 3 7.2 0" strokeWidth={2.4} fill="none" />

        {/* ---- the helmet: dome first, brim over it ---- */}
        <path
          d="M48 30.5 C48 17.5 53.2 11 60 11 C66.8 11 72 17.5 72 30.5 Z"
          fill={ink}
          fillOpacity={0.2}
        />
        <path d="M60 11.4 V30" strokeWidth={1.8} strokeOpacity={0.45} fill="none" />
        <path
          d="M53.6 13.8 C51.4 18.2 50.8 24 50.8 30"
          strokeWidth={1.6}
          strokeOpacity={0.35}
          fill="none"
        />
        <path
          d="M66.4 13.8 C68.6 18.2 69.2 24 69.2 30"
          strokeWidth={1.6}
          strokeOpacity={0.35}
          fill="none"
        />
        {/* Brim: 37 wide against a 23-wide head, so it overhangs by about a
            third each side — a hard hat, not a sun hat. */}
        <path
          d="M41.5 30.5 Q60 26.5 78.5 30.5 Q60 36.8 41.5 30.5 Z"
          fill={ink}
          fillOpacity={0.2}
        />
      </g>
    </svg>
  );
}

/** How long her opening line stays up before she folds it away. */
const INTRO_MS = 6000;

export function SiteGuide() {
  const [stop, setStop] = useState<Stop | null>(null);
  /**
   * The ground of the section she is currently over.
   *
   * She is `position: fixed`, so she sits outside every `[data-theme]` scope
   * and would otherwise be stuck with the root's paper ground — a white disc
   * punched through the ink sections. Mirroring the active section's theme onto
   * her own root re-runs the same variable switch the sections use, so she
   * takes on the page's ground as she travels across it.
   */
  const [theme, setTheme] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  /**
   * Which stop's line is currently showing, rather than a plain `open` flag.
   *
   * Scrolling to a new section has to close the bubble — otherwise she is left
   * holding up the previous section's line. Keyed by id, that falls out of the
   * render: the bubble is open only while the stored id is still the stop the
   * observer is reporting. A boolean would need an effect to clear it, which is
   * the cascading-render pattern this codebase avoids everywhere else.
   */
  const [openFor, setOpenFor] = useState<string | null>(null);

  // Which section holds the viewport. Most-visible wins rather than first-seen,
  // so a short section sandwiched between two tall ones still gets its turn.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-guide]');
    if (!targets.length) return;

    const ratios = new Map<string, number>();
    let introduced = false;
    let introTimer = 0;

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

        const section = bestId
          ? document
              .querySelector(`[data-guide="${bestId}"]`)
              ?.querySelector<HTMLElement>('[data-theme]')
          : null;
        setTheme(section?.dataset.theme ?? null);

        // She introduces herself once, the first time she arrives, then gets
        // out of the way. Without it nobody learns she is tappable at all.
        if (next && !introduced) {
          introduced = true;
          setOpenFor(next.id);
          introTimer = window.setTimeout(
            () => setOpenFor((current) => (current === next.id ? null : current)),
            INTRO_MS,
          );
        }
      },
      // A ladder of thresholds: a section taller than the viewport never
      // crosses a high one, and one shorter than it never crosses a low one.
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of targets) observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(introTimer);
    };
  }, []);

  if (!stop || dismissed) return null;

  const open = openFor === stop.id;

  return (
    <div
      className="site-guide"
      data-theme={theme ?? undefined}
      data-side={stop.side}
      data-open={open || undefined}
      style={{ '--guide-lift': `${stop.lift}rem` } as React.CSSProperties}
    >
      <p className="site-guide__bubble" role="status">
        {stop.says}
        <button
          type="button"
          className="site-guide__dismiss"
          onClick={() => setDismissed(true)}
        >
          Hide the guide
        </button>
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
        <Architect />
      </button>
    </div>
  );
}
