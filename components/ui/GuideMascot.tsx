'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * The guide: a small robot, drawn rather than dropped in as a picture.
 *
 * Drawing it is what buys the behaviour. A raster mascot cannot blink, cannot
 * follow a cursor, and cannot lift its own values when the page changes ground
 * underneath it. All three are the reason this is geometry and CSS variables
 * instead of a 113KB render.
 *
 * WHY THIS CHARACTER SURVIVES THE TRANSLATION. Its reference sheet is a shaded
 * 3-D render, and most of those lose everything on the way into SVG. This one
 * does not, because it is already built from primitives: a squircle head, a
 * rounded screen, two discs, a half-disc mouth, two antennae, four nubs. Two
 * soft gradients carry the shading and nothing else has to be faked.
 *
 * The blink is the character sheet's own idea. Squashing the eyes to a bar is
 * exactly its `boring` and `doubt` frames, so the closed state is on-model
 * rather than invented.
 */

/** How far a pupil may travel from centre, in viewBox units. */
const GAZE_RANGE = 3.4;
/** Distance in px at which the gaze is fully deflected; nearer is no stronger. */
const GAZE_FALLOFF = 420;

export function GuideMascot({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gazeRef = useRef<SVGGElement>(null);
  const uid = useId().replace(/:/g, '');

  /**
   * The eyes follow the pointer.
   *
   * Written straight to the node on an animation frame rather than through
   * state: this fires on every pointer move across the whole document, and the
   * rest of this page has already had its per-frame React renders taken out for
   * exactly this reason. One rAF in flight at a time, so a fast sweep coalesces
   * into a single write per frame instead of hundreds.
   */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A coarse pointer has no hovering position to track — on a phone the gaze
    // would freeze wherever the last tap landed, which reads as broken.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      frame = 0;
      const svg = svgRef.current;
      const gaze = gazeRef.current;
      if (!svg || !gaze) return;

      const box = svg.getBoundingClientRect();
      // The screen sits in the upper half of the figure, so the gaze is
      // measured from there. Taken from the centre of the whole body it lags
      // behind anything above the mascot, which is most of the page.
      const cx = box.left + box.width * 0.5;
      const cy = box.top + box.height * 0.38;

      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // Direction at full strength, magnitude easing off with distance: a
      // pointer just outside the mascot should not look the same as one across
      // the room.
      const reach = Math.min(1, dist / GAZE_FALLOFF);
      const ox = (dx / dist) * reach * GAZE_RANGE;
      const oy = (dy / dist) * reach * GAZE_RANGE * 0.62;

      gaze.style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const shell = `gm-shell-${uid}`;
  const torso = `gm-torso-${uid}`;
  const glass = `gm-glass-${uid}`;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 138"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        {/* The only shading in the drawing. Light from the upper left, which is
            where the reference sheet puts it. */}
        <linearGradient id={shell} x1="0.18" y1="0" x2="0.78" y2="1">
          <stop offset="0" stopColor="var(--gm-shell-hi)" />
          <stop offset="0.55" stopColor="var(--gm-shell)" />
          <stop offset="1" stopColor="var(--gm-shell-lo)" />
        </linearGradient>
        <linearGradient id={torso} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="var(--gm-body-hi)" />
          <stop offset="1" stopColor="var(--gm-body)" />
        </linearGradient>
        {/* The screen is not flat black. It lifts very slightly towards the
            bottom right, which is the only thing that makes it read as glass
            set into a shell rather than a hole cut in it. */}
        <radialGradient id={glass} cx="0.62" cy="0.7" r="0.85">
          <stop offset="0" stopColor="var(--gm-screen-hi)" />
          <stop offset="1" stopColor="var(--gm-screen)" />
        </radialGradient>
      </defs>

      {/* ---- antennae and ear discs sit behind the shell, so they read as
              coming out of the head rather than being stuck on it. */}
      <g stroke="var(--gm-shell-lo)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M40 22 L31 6" />
        <path d="M80 22 L89 6" />
      </g>
      <g fill="var(--gm-body)">
        <circle cx="30" cy="4.5" r="4.4" />
        <circle cx="90" cy="4.5" r="4.4" />
      </g>
      <g>
        <ellipse cx="18" cy="52" rx="7" ry="10" fill="var(--gm-shell-lo)" />
        <ellipse cx="16.4" cy="52" rx="4.2" ry="6.6" fill="var(--gm-body)" opacity="0.45" />
        <ellipse cx="102" cy="52" rx="7" ry="10" fill="var(--gm-shell-lo)" />
        <ellipse cx="103.6" cy="52" rx="4.2" ry="6.6" fill="var(--gm-body)" opacity="0.45" />
      </g>

      {/* ---- the body. Drawn before the head so the head sits down over it
              like a helmet: that overlap is most of what sets the proportions,
              and without it the two read as a snowman. */}
      <path
        d="M76 92 q15 1 19 12"
        stroke="var(--gm-body)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="43" y="76" width="34" height="34" rx="16" fill={`url(#${torso})`} />
      <g fill="var(--gm-body)">
        <ellipse cx="51" cy="115" rx="11.5" ry="9" />
        <ellipse cx="70" cy="115" rx="11.5" ry="9" />
      </g>

      {/* ---- the head.
              A squircle rather than a rounded rectangle: the reference's
              corners tighten as they turn, and a uniform `rx` is exactly what
              made the first pass read as a television set. The bottom is a
              little wider than the top, which is the whole of its friendliness. */}
      <path
        d="M17 50
           C17 26 31 13 60 13
           C89 13 103 26 103 50
           C103 75 90 89 60 89
           C30 89 17 75 17 50 Z"
        fill={`url(#${shell})`}
      />
      {/* Rim light along the edge the light actually falls on. */}
      <path
        d="M27 36 C31 23 42 17 57 16.4"
        stroke="var(--gm-shell-hi)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      <rect x="28" y="25" width="64" height="47" rx="17" fill={`url(#${glass})`} />
      {/* The bezel's own shadow falling onto the glass, top left only. */}
      <path
        d="M34 34 C36 29 41 26.5 47 26.2"
        stroke="#000"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* ---- the face. The whole face travels with the gaze — on this character
              the eyes are the face, so moving them alone would read as the
              features sliding off it. */}
      <g ref={gazeRef} className="gm-gaze">
        <g className="gm-eye">
          <circle cx="48" cy="44" r="7.8" fill="var(--gm-glow)" />
        </g>
        <g className="gm-eye gm-eye--right">
          <circle cx="72" cy="44" r="7.8" fill="var(--gm-glow)" />
        </g>
        {/* The mouth: a half-disc, flat edge up, exactly as the sheet draws it. */}
        <path d="M53 57 H67 A7 7 0 0 1 53 57 Z" fill="var(--gm-glow)" />
      </g>

      {/* ---- the arm that waves, drawn last and swung wide of the head.
              Tucked behind it like the other arm it simply disappeared: the
              head is most of this character's width, so the only place a raised
              hand can be seen is outside its silhouette. */}
      <g className="gm-wave" style={{ transformOrigin: '44px 92px' }}>
        <path
          d="M44 92 Q24 90 13 73"
          stroke="var(--gm-body)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
      </g>

    </svg>
  );
}
