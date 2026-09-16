import Link from 'next/link';

/**
 * The link out of a home-page section to the page that carries it in full.
 *
 * These were set in u-label, which is the same 11px muted uppercase as the
 * eyebrow sitting directly above them — so "All five services" looked like a
 * second caption rather than something you could press. An outlined pill is
 * the affordance the site already teaches in ContactCta, where the secondary
 * action is a bordered pill and the primary one is that pill filled; hovering
 * one of these completes the same move.
 *
 * The arrow is → rather than ↗: ↗ is spoken for on this site, marking links
 * that leave it (Instagram, LinkedIn).
 */
export function SectionLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-3 rounded-full border border-[var(--hairline)] px-7 py-3.5 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[var(--figure)] transition-colors duration-300 hover:border-[var(--figure)] hover:bg-[var(--figure)] hover:text-[var(--ground)] ${className}`}
    >
      {/* Tracking adds its space after the last letter too, which would read as
          a wider gap before the arrow than the gap-3 actually asks for. */}
      <span className="-mr-[0.32em]">{children}</span>
      <span
        aria-hidden="true"
        className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
