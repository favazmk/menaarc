'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * The guide: the hard-hat robot, taken from its own render.
 *
 * A drawing could not keep the render's detailing, so the pixels are the
 * render's own, cut into the layers that have to move independently:
 *
 *   body.webp   everything that stays still, with the face wiped off the visor
 *   arm.webp    the waving forearm, split at the elbow
 *
 * The face and the jet flames are geometry on top, because those are the parts
 * with behaviour. The eyes follow the pointer and blink, the flames flicker,
 * and the arm pivots on the elbow. Every coordinate below is in the render's
 * pixel space, so the vector parts line up with the raster exactly.
 *
 * The sheet's side views are the flight poses: left.webp and right.webp.
 * SiteGuide sets `data-pose` from the direction of travel and the
 * CSS cross-fades to the matching view. Only the front pose is rigged, which is
 * enough: the guide is only ever still, and so only ever looked at, facing you.
 */

/** Soles and trail angle per pose, in the sheet's tile pixels. */
const JETS = {
  front: {
    soles: [
      [90, 474],
      [177, 492],
    ],
    angle: 22,
  },
  right: {
    soles: [
      [57, 467],
      [130, 480],
    ],
    angle: 40,
  },
  left: {
    soles: [
      [232, 480],
      [318, 465],
    ],
    angle: -40,
  },
} as const;

/** Where each flight view sits in the tile, as cropped by the export. */
const VIEWS = {
  right: [31, 43, 330, 452],
  left: [11, 41, 331, 460],
} as const;

/** How far a pupil may travel from centre, in viewBox units. */
const GAZE_RANGE = 12;
/** Distance in px at which the gaze is fully deflected; nearer is no stronger. */
const GAZE_FALLOFF = 420;

export function GuideMascot({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gazeRef = useRef<SVGGElement>(null);
  const uid = useId().replace(/\W/g, '');

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

    let frame = 0;
    let px = 0;
    let py = 0;
    let rest = 0;

    const apply = () => {
      frame = 0;
      const svg = svgRef.current;
      const gaze = gazeRef.current;
      if (!svg || !gaze) return;

      const box = svg.getBoundingClientRect();
      // The visor sits in the upper third of the figure, so the gaze is
      // measured from there. Taken from the centre of the whole body it lags
      // behind anything above the mascot, which is most of the page.
      const cx = box.left + box.width * 0.62;
      const cy = box.top + box.height * 0.3;

      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // Direction at full strength, magnitude easing off with distance: a
      // pointer just outside the mascot should not look the same as one across
      // the room.
      // On a phone the whole screen is closer than the desktop falloff.
      const reach = Math.min(1, dist / Math.min(GAZE_FALLOFF, window.innerWidth * 0.5));
      const ox = (dx / dist) * reach * GAZE_RANGE;
      const oy = (dy / dist) * reach * GAZE_RANGE * 0.62;

      gaze.style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
    };

    const look = (x: number, y: number) => {
      px = x;
      py = y;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') look(e.clientX, e.clientY);
    };

    // Touch has no hovering position, so the eyes follow the finger while it
    // is down, scrolls included (pointer events stop once a scroll takes over;
    // touch events keep coming). After it lifts they drift back to centre
    // rather than staring at wherever the last tap landed.
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      clearTimeout(rest);
      look(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      clearTimeout(rest);
      rest = window.setTimeout(() => {
        const gaze = gazeRef.current;
        if (gaze) gaze.style.transform = '';
      }, 900);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(rest);
    };
  }, []);

  const flame = `gm-flame-${uid}`;
  const glow = `gm-glow-${uid}`;
  const haze = `gm-haze-${uid}`;

  /** Jet flames behind the boots, trailing the way the render's do. */
  const jets = (pose: keyof typeof JETS) =>
    JETS[pose].soles.map(([x, y], i) => (
      <g key={x} transform={`translate(${x} ${y}) rotate(${JETS[pose].angle})`}>
        {/* Two flames on one clock pulse like a single light. */}
        <g
          className="gm-flame"
          filter={`url(#${haze})`}
          style={i ? { animationDuration: '0.19s' } : undefined}
        >
          <path d="M-17 -4 C-17 40 -8 80 0 125 C8 80 17 40 17 -4 Z" fill={`url(#${flame})`} />
          <path d="M-8 -4 C-8 22 -3 45 0 70 C3 45 8 22 8 -4 Z" fill="#e9feff" opacity="0.8" />
        </g>
      </g>
    ));

  return (
    <svg
      ref={svgRef}
      viewBox="0 30 400 565"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={flame} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ff7ff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#22d3ee" stopOpacity="0.45" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id={haze} x="-100%" y="-20%" width="300%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="bloom" />
          <feMerge>
            <feMergeNode in="bloom" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {(Object.keys(VIEWS) as (keyof typeof VIEWS)[]).map((pose) => {
        const [x, y, w, h] = VIEWS[pose];
        return (
          <g key={pose} className={`gm-pose gm-pose--${pose}`}>
            {jets(pose)}
            <image href={`/mascot/${pose}.webp`} x={x} y={y} width={w} height={h} />
          </g>
        );
      })}

      <g className="gm-pose gm-pose--front">
        {jets('front')}

        <image href="/mascot/body.webp" x="28" y="30" width="362" height="476" />

        {/* The chest core breathes, the one light that is not the face. */}
        <circle
          className="gm-core"
          cx="236"
          cy="316"
          r="11"
          fill="#8ff7ff"
          opacity="0.3"
          filter={`url(#${haze})`}
          style={{ mixBlendMode: 'screen' }}
        />

        <g className="gm-wave" style={{ transformOrigin: '148px 290px' }}>
          <image href="/mascot/arm.webp" x="33" y="224" width="108" height="96" />
        </g>

        {/* The face: the render's happy-closed eyes and smile, redrawn so they move. */}
        <g ref={gazeRef} className="gm-gaze">
          <g fill="none" stroke="#8ff7ff" strokeLinecap="round" filter={`url(#${glow})`}>
            <path className="gm-eye" d="M182 204 Q202 151 222 206" strokeWidth="10" />
            <path className="gm-eye gm-eye--right" d="M276 212 Q296 161 318 218" strokeWidth="10" />
            <path d="M232 222 Q247 241 261 225" strokeWidth="7" />
          </g>
        </g>
      </g>
    </svg>
  );
}
