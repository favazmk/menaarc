import Image from 'next/image';

import { Reveal } from '@/components/ui/Reveal';

/**
 * A drawing set into a section as if it were drawn on the page.
 *
 * These are concept drawings, never photographs. The studio's own photography
 * is the only thing on the site allowed to look built — /work is headlined
 * "Built, not rendered" — so anything generated stays unmistakably a sketch,
 * and carries no caption that could attach it to a real project.
 *
 * The files carry the drawing as ink on a transparent ground: each pixel's
 * darkness in the original became its opacity. An earlier version blended
 * white-ground files with mix-blend-mode instead, and it broke wherever an
 * ancestor formed a stacking context — Reveal while it fades, a sticky column
 * always — because a blend only mixes with its own context's backdrop, which
 * there is transparent. Alpha has no such condition: the grid lines behind
 * show through the paper, on any ground.
 */
export function Illustration({
  src,
  width,
  height,
  delay = 0,
  className = '',
  sizes = '(min-width: 768px) 33vw, 100vw',
}: {
  src: string;
  width: number;
  height: number;
  delay?: number;
  className?: string;
  sizes?: string;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <Image
        src={src}
        // Decorative: the section's text already says what the drawing shows.
        alt=""
        width={width}
        height={height}
        sizes={sizes}
        className="h-auto w-full"
      />
    </Reveal>
  );
}
