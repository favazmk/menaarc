'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useIsClient, useMediaQuery, usePrefersReducedMotion } from '@/lib/use-media-query';

import { useFrameLoader, type FilmManifest, type TierSpec } from './useFrameLoader';
import { FilmChapters, type Chapter } from './FilmChapters';
import { FilmLoader } from './FilmLoader';

type Props = {
  manifest: FilmManifest;
  chapters: Chapter[];
  /** Scroll distance as a multiple of viewport height. Longer = slower film. */
  scrollLength?: number;
};

/**
 * Where the closing weather starts, as film progress.
 *
 * The master ends mid-move, on an interior frame that resolves nothing — held
 * at the last frame it reads as a stall, as though the video buffered. Rather
 * than re-cut the master, the last stretch of scroll drives cloud in off the
 * cliff until it has taken the screen.
 *
 * That gives the pin an ending it did not have, and it lands somewhere useful:
 * the fog settles on very near paper, which is the exact ground the client wall
 * below is on, so the unpinning reads as the weather clearing into the next
 * section instead of a cut. The final chapter must have flown past the camera
 * before this closes over it — see the ranges in film-chapters.json.
 */
const FOG_FROM = 0.9;

/** Picks the tier before any frame is requested, so we never load both. */
function chooseTier(manifest: FilmManifest): { key: string; spec: TierSpec } {
  const tiers = manifest.tiers;
  const has = (k: string) => Boolean(tiers[k]);

  if (typeof window === 'undefined') {
    const key = has('desktop') ? 'desktop' : Object.keys(tiers)[0];
    return { key, spec: tiers[key] };
  }

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };

  const frugal =
    nav.connection?.saveData === true ||
    /^(slow-)?2g$/.test(nav.connection?.effectiveType ?? '') ||
    (nav.deviceMemory ?? 8) <= 2;

  const narrow = window.matchMedia('(max-width: 900px)').matches;

  const key = (frugal || narrow) && has('mobile') ? 'mobile' : has('desktop') ? 'desktop' : Object.keys(tiers)[0];
  return { key, spec: tiers[key] };
}

export function ScrollFilm({ manifest, chapters, scrollLength = 6 }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef({ value: 0 });

  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();
  const mounted = useIsClient();
  const narrow = useMediaQuery('(max-width: 900px)');

  // Tier selection reads the device, so it cannot run during SSR.
  const tier = useMemo(
    () => (mounted && !reduced ? chooseTier(manifest) : null),
    [mounted, reduced, manifest],
  );

  const spec = tier?.spec ?? null;
  const { primed, complete, failed, progress: loadProgress, getFrame } = useFrameLoader(spec);

  /**
   * A landscape master in a portrait viewport cannot fill the frame without
   * throwing most of each shot away — a 16:9 source cropped to 9:16 loses about
   * two thirds of its width, and the cantilever reveal with it.
   *
   * So when the shapes are far apart the film becomes a cinematic strip at the
   * top of the viewport and the chapter type sits beneath it on solid ink.
   * Cropping stays off; the letterbox is deliberate framing rather than dead
   * space. A true 9:16 master makes this branch simply stop triggering.
   */
  const strip = useMemo(() => {
    if (!spec || !mounted) return null;
    const aspect = spec.aspect ?? spec.width / spec.height;
    const viewport = window.innerWidth / window.innerHeight;
    if (aspect / viewport <= 1.45) return null;
    return { aspect };
  }, [spec, mounted]);

  // Full-bleed on a phone puts the frame edge to edge, so centred type would
  // land in the middle of the picture. Anchor it low instead.
  const layout = strip ? 'stacked' : narrow ? 'bottom' : 'overlay';

  // Eased so the cloud gathers slowly and then takes the frame quickly, which
  // is how weather actually arrives — a linear ramp reads as a dissolve.
  const fogT = Math.min(1, Math.max(0, (progress - FOG_FROM) / (1 - FOG_FROM)));
  const fog = fogT ** 1.7;

  /**
   * Paint one frame, cropped to fill the canvas it is given.
   *
   * Always cover: in strip mode the canvas element itself already carries the
   * master's aspect ratio, so covering it crops nothing. Letterboxing is done
   * by the layout, never inside the bitmap.
   */
  const draw = useMemo(() => {
    return (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !spec) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const img = getFrame(frameIndex);
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;

      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };
  }, [getFrame, spec]);

  // Size the backing store to the element, capped at 2x DPR. Beyond that the
  // extra pixels cost fill-rate on every scroll frame and buy nothing visible.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(Math.round(progressRef.current.value));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  // Repaint when new frames land, so the visible frame sharpens as the tail
  // of the sequence arrives instead of waiting for the next scroll event.
  useEffect(() => {
    draw(Math.round(progressRef.current.value));
  }, [draw, loadProgress]);

  // A layout effect, not a passive one, and that is the whole point.
  //
  // `pin: true` wraps this section in a .pin-spacer div, so the section's real
  // parent stops being the <main> that React put it in. React's own record is
  // never updated, so when you navigate away from the home page it calls
  // main.removeChild(section) against a node whose parent is now the spacer and
  // throws NotFoundError, which takes the whole render down — the browser shows
  // its own "this page couldn't load" page, and only a reload recovers.
  //
  // A passive cleanup runs too late to prevent that. A layout cleanup reverts
  // the pin, unwrapping the spacer, while the tree React is about to remove
  // still matches the DOM. This is the reason GSAP's own useGSAP hook is built
  // on useLayoutEffect.
  useLayoutEffect(() => {
    if (reduced || !spec) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const lastIndex = spec.frameCount - 1;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${scrollLength * 100}%`,
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const target = self.progress * lastIndex;
          // Quantising to whole frames stops a fast flick from queuing a paint
          // per sub-pixel step; the decoder is the bottleneck, not the maths.
          const next = Math.round(target);
          if (next !== Math.round(progressRef.current.value)) {
            progressRef.current.value = next;
            draw(next);
          }
          setProgress(self.progress);
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced, spec, draw, scrollLength]);

  // Reduced motion: a still poster and normal document flow. No pin, no canvas.
  if (reduced) {
    return (
      <section data-theme="dark" className="relative bg-[var(--ground)]">
        <h1 className="sr-only">MENAARC — architectural consultants in Dubai</h1>
        <div className="relative h-[70svh] w-full overflow-hidden">
          <picture>
            <source srcSet="/film/poster-desktop.avif" type="image/avif" />
            <img
              src="/film/poster-desktop.webp"
              alt="A concrete house cantilevered over a cliff face, seen from the approach."
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
        <div className="u-shell py-24">
          <ol className="grid gap-16 md:grid-cols-2">
            {chapters.map((c) => (
              <li key={c.id}>
                <p className="u-label">
                  {c.index} — {c.label}
                </p>
                <h2
                  className="mt-4 font-[family-name:var(--font-display)] uppercase leading-[0.94]"
                  style={{ fontSize: 'var(--text-headline)', fontWeight: 300, letterSpacing: '0.045em' }}
                >
                  {c.headline}
                </h2>
                <p className="u-label mt-4">{c.sub}</p>
                <ul className="mt-4 border-l border-[var(--hairline)] pl-4">
                  {c.specs.map((spec) => (
                    <li key={spec} className="u-label py-[0.3rem]" style={{ fontSize: '0.625rem' }}>
                      {spec}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      aria-label="Scroll-controlled architectural film"
      className="relative h-[100svh] w-full overflow-hidden bg-[var(--color-ink)]"
    >
      {/* The hero is a canvas, so the page's h1 has no visible home. It lives
          here rather than nowhere: the document needs one, and it has to come
          before the chapter h2s in reading order. */}
      <h1 className="sr-only">MENAARC — architectural consultants in Dubai</h1>
      <p className="sr-only">
        A continuous camera move through a concrete house built into a cliff face — from
        the cantilevered exterior above a waterfall, in across the threshold, through the
        living volume and dining room, to an oak-lined passage and open stair.
      </p>

      {/* In strip mode the canvas carries the master's own aspect ratio and
          sits at the top; otherwise it fills the viewport. */}
      <div
        className="absolute inset-x-0 top-0"
        style={
          strip
            ? { aspectRatio: String(strip.aspect), top: '20svh' }
            : { bottom: 0 }
        }
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="h-full w-full transition-opacity duration-700"
          style={{ opacity: primed ? 1 : 0 }}
        />

        {/* Legibility scrim, shaped to wherever the type actually sits.
            A left-weighted grade under centred desktop copy; a bottom-weighted
            one under low-anchored phone copy; barely anything over a strip,
            where the type is already on ink. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              layout === 'stacked'
                ? 'linear-gradient(to bottom, rgb(10 10 10 / 0.35) 0%, transparent 22%, transparent 100%)'
                : layout === 'bottom'
                  ? 'linear-gradient(to bottom, rgb(10 10 10 / 0.5) 0%, transparent 20%, transparent 34%, rgb(10 10 10 / 0.58) 56%, rgb(10 10 10 / 0.86) 76%, rgb(10 10 10 / 0.95) 100%)'
                  : 'linear-gradient(to right, rgb(10 10 10 / 0.78) 0%, rgb(10 10 10 / 0.45) 34%, rgb(10 10 10 / 0.05) 66%, transparent 100%),' +
                    'linear-gradient(to bottom, rgb(10 10 10 / 0.6) 0%, rgb(10 10 10 / 0.1) 28%, rgb(10 10 10 / 0.14) 64%, rgb(10 10 10 / 0.72) 100%)',
          }}
        />
      </div>

      <FilmChapters
        chapters={chapters}
        progress={progress}
        layout={layout}
        bandBottom={strip ? `calc(20svh + 100vw / ${strip.aspect})` : '0px'}
      />

      {/* The closing weather. Three offset radial banks rather than one flat
          wash, so the cloud has a near edge and a far one and reads as volume;
          they drift apart and swell as the scroll drives them in, which is the
          parallax that stops it looking like a dip to white.

          Kept to transform and opacity — no filters — because this rides the
          same scroll frames as the canvas repaint, and a blur here would cost
          more than the whole frame decode. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: fog, visibility: fog <= 0.001 ? 'hidden' : 'visible' }}
      >
        <div
          className="absolute inset-[-25%]"
          style={{
            transform: `scale(${(1.35 - 0.35 * fog).toFixed(3)}) translate3d(${(-9 * (1 - fog)).toFixed(2)}%, ${(7 * (1 - fog)).toFixed(2)}%, 0)`,
            background:
              'radial-gradient(60% 52% at 22% 68%, rgb(232 233 236 / 0.95) 0%, rgb(232 233 236 / 0) 68%),' +
              'radial-gradient(56% 46% at 74% 40%, rgb(244 245 247 / 0.9) 0%, rgb(244 245 247 / 0) 66%),' +
              'radial-gradient(80% 70% at 48% 88%, rgb(222 224 228 / 0.92) 0%, rgb(222 224 228 / 0) 72%)',
            willChange: 'transform',
          }}
        />
        {/* The last of it: a flat settle onto the paper the next section is on,
            so the pin releases into that ground rather than cutting to it. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--color-paper)',
            opacity: Math.max(0, (fog - 0.55) / 0.45) ** 1.4,
          }}
        />
      </div>

      {!primed ? <FilmLoader progress={loadProgress} failed={failed} /> : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[3.5rem] left-0 right-0 flex justify-center"
        style={{ opacity: progress > 0.04 ? 0 : 1, transition: 'opacity 400ms' }}
      >
        <span className="u-label text-[var(--color-paper)]/70">Scroll</span>
      </div>

      {complete ? null : (
        <span className="sr-only" aria-live="polite">
          Film loading, {Math.round(loadProgress * 100)} percent
        </span>
      )}
    </section>
  );
}
