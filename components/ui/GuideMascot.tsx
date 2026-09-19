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
  const screen = `gm-screen-${uid}`;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 160 180"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={shell} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f3f4f6" />
          <stop offset="1" stopColor="#d1d5db" />
        </linearGradient>
        <linearGradient id={screen} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#374151" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="gm-leg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9fafb" />
          <stop offset="1" stopColor="#e5e7eb" />
        </linearGradient>
        <linearGradient id="gm-reflection" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="gm-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.15" />
        </filter>
        <filter id="gm-inner-shadow">
          <feOffset dx="0" dy="4"/>
          <feGaussianBlur stdDeviation="3" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood floodColor="black" floodOpacity="0.5" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>
      </defs>

      {/* ---- Antennae (Rings) */}
      <g stroke="#ffffff" strokeWidth="6" fill="#9ca3af" filter="url(#gm-drop-shadow)">
        <circle cx="60" cy="30" r="12" />
        <circle cx="100" cy="30" r="12" />
      </g>
      <g fill="#d1d5db">
        <rect x="54" y="42" width="12" height="10" />
        <rect x="94" y="42" width="12" height="10" />
      </g>

      {/* ---- Legs & Feet */}
      <g className="gm-leg-left">
        <rect x="65" y="140" width="12" height="20" fill="url(#gm-leg)" />
        <g filter="url(#gm-drop-shadow)">
          <path d="M55 160 Q60 150 71 150 Q77 150 79 160 Z" fill="#9ca3af" />
          <path d="M55 160 L79 160 L79 165 L55 165 Z" fill="#6b7280" />
        </g>
      </g>
      <g className="gm-leg-right">
        <rect x="85" y="140" width="12" height="20" fill="url(#gm-leg)" />
        <g filter="url(#gm-drop-shadow)">
          <path d="M81 160 Q86 150 97 150 Q103 150 105 160 Z" fill="#9ca3af" />
          <path d="M81 160 L105 160 L105 165 L81 165 Z" fill="#6b7280" />
        </g>
      </g>

      {/* ---- Arms (Back part) */}
      <g className="gm-arm-left" filter="url(#gm-drop-shadow)">
        <path d="M30 90 L20 120" stroke="#9ca3af" strokeWidth="12" strokeLinecap="round" />
        <circle cx="18" cy="125" r="10" fill="url(#gm-leg)" />
      </g>

      <g className="gm-arm-right gm-wave" style={{ transformOrigin: '130px 90px' }} filter="url(#gm-drop-shadow)">
        <path d="M130 90 L140 120" stroke="#9ca3af" strokeWidth="12" strokeLinecap="round" />
        <circle cx="142" cy="125" r="10" fill="url(#gm-leg)" />
      </g>

      {/* ---- Body/Head */}
      <rect x="30" y="50" width="100" height="90" rx="20" fill={`url(#${shell})`} filter="url(#gm-drop-shadow)" />
      
      {/* Lower body details (Slot and Button) */}
      <path d="M30 115 L130 115" stroke="#9ca3af" strokeWidth="2" opacity="0.3" />
      
      <rect x="65" y="122" width="30" height="4" rx="2" fill="#111827" filter="url(#gm-inner-shadow)" />
      <rect x="66" y="123" width="15" height="2" rx="1" fill="#4ade80" />
      
      <rect x="110" y="119" width="10" height="8" rx="3" fill="#9ca3af" filter="url(#gm-drop-shadow)" />

      {/* ---- Screen */}
      <rect x="42" y="65" width="76" height="42" rx="12" fill={`url(#${screen})`} filter="url(#gm-inner-shadow)" />
      {/* Screen Reflection */}
      <path d="M42 77 Q80 77 118 65 L118 107 L42 107 Z" fill="url(#gm-reflection)" opacity="0.8" />
      
      {/* Inner Screen Bezel Highlight */}
      <rect x="43" y="66" width="74" height="40" rx="11" fill="none" stroke="#4b5563" strokeWidth="2" opacity="0.5" />

      {/* ---- Face elements grouped to move with gaze */}
      <g ref={gazeRef} className="gm-gaze">
        {/* Eyes */}
        <g className="gm-eye">
          <ellipse cx="65" cy="83" rx="4.5" ry="7" fill="#ffffff" filter="drop-shadow(0px 0px 4px rgba(255,255,255,0.5))" />
        </g>
        <g className="gm-eye gm-eye--right">
          <ellipse cx="95" cy="83" rx="4.5" ry="7" fill="#ffffff" filter="drop-shadow(0px 0px 4px rgba(255,255,255,0.5))" />
        </g>
        
        {/* Smile */}
        <path d="M76 89 Q80 92 84 89" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        
        {/* Blush */}
        <ellipse cx="58" cy="92" rx="4" ry="2.5" fill="#ef4444" opacity="0.8" filter="drop-shadow(0px 0px 2px rgba(239,68,68,0.5))" />
        <ellipse cx="102" cy="92" rx="4" ry="2.5" fill="#ef4444" opacity="0.8" filter="drop-shadow(0px 0px 2px rgba(239,68,68,0.5))" />
      </g>
    </svg>
  );
}
