'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Wordmark } from '@/components/brand/Wordmark';
import { Magnetic } from '@/components/ui/Magnetic';
import { site } from '@/lib/site';

/**
 * Header theme follows whichever section is actually sitting under it, found by
 * hit-testing the header band on scroll.
 *
 * A fixed scroll offset cannot work here: the film section is pinned for
 * several viewport heights, so `scrollY > 100vh` flips the header to dark text
 * while the dark film is still on screen. Sections declare their own ground
 * with `data-theme`, and the header simply reads the nearest one.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(pathname === '/');
  const [lifted, setLifted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;

    const sample = () => {
      frame = 0;
      const header = headerRef.current;

      // Find what is behind the header, not the header itself. elementsFromPoint
      // returns the whole z-order stack, so the first entry outside the header
      // subtree is the section actually underneath.
      //
      // A single elementFromPoint is not enough: the gutter shrinks to 20px on
      // a phone, so a fixed probe near the left edge lands on the wordmark,
      // finds no [data-theme] ancestor, and the header silently falls back to
      // its light palette over a dark film.
      const stack = document.elementsFromPoint(24, 30);
      const behind = stack.find((el) => !header || !header.contains(el));
      const themed = behind?.closest<HTMLElement>('[data-theme]');

      setOnDark(themed?.dataset.theme === 'dark');
      setLifted(window.scrollY > 16);
    };

    const onScroll = () => {
      // elementFromPoint forces layout, so coalesce to one read per frame.
      if (!frame) frame = requestAnimationFrame(sample);
    };

    frame = requestAnimationFrame(sample);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      // The header must not carry data-theme itself, or the probe above would
      // find the header instead of the section behind it.
      className="pointer-events-none fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      style={{
        color: onDark ? 'var(--color-paper)' : 'var(--color-ink)',
        // Transparent at the top of a page, where the hero is designed around
        // it. Once anything scrolls underneath it needs a ground, or headings
        // and stat values pass straight through the nav and both become
        // unreadable.
        backgroundColor: lifted
          ? onDark
            ? 'rgb(10 10 10 / 0.5)'
            : 'rgb(250 250 250 / 0.78)'
          : 'transparent',
        backdropFilter: lifted ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: lifted ? 'blur(14px)' : 'none',
        borderBottom: lifted
          ? `1px solid ${onDark ? 'rgb(250 250 250 / 0.12)' : 'rgb(10 10 10 / 0.1)'}`
          : '1px solid transparent',
      }}
    >
      <div className="u-shell pointer-events-none flex items-center justify-between py-5">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          onClick={() => setOpen(false)}
          className="pointer-events-auto relative z-10"
        >
          <Wordmark size="sm" />
        </Link>

        <nav aria-label="Primary" className="pointer-events-auto hidden items-center gap-9 md:flex">
          {site.nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Magnetic key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="u-label transition-opacity hover:opacity-100"
                  style={{ color: 'currentColor', opacity: active ? 1 : 0.66 }}
                >
                  {item.label}
                </Link>
              </Magnetic>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="u-label pointer-events-auto relative z-10 md:hidden"
          style={{ color: 'currentColor' }}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="pointer-events-auto fixed inset-0 bg-[var(--color-ink)] text-[var(--color-paper)] md:hidden"
      >
        <nav aria-label="Primary" className="u-shell flex h-full flex-col justify-center gap-2">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="u-headline py-2"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${site.contact.email}`}
            className="u-label mt-10 text-[var(--color-paper)]/60"
          >
            {site.contact.email}
          </a>
        </nav>
      </div>
    </header>
  );
}
