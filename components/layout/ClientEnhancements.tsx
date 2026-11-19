'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { composeMessage } from '@/components/sections/ContactForm';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { sectors } from '@/lib/services';
import { site } from '@/lib/site';
import { whatsappHref } from '@/lib/whatsapp';

const FIELD =
  'mt-2 block w-full rounded-xl border border-[color-mix(in_srgb,var(--figure)_22%,transparent)] bg-[var(--ground)] px-4 py-3 text-[0.9375rem] text-[var(--figure)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[color-mix(in_srgb,var(--muted)_75%,transparent)] hover:border-[color-mix(in_srgb,var(--figure)_45%,transparent)] focus:border-[var(--figure)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]';

const SECTOR_OPTIONS = [...sectors, 'Other'];

/**
 * "Get a free quote" — a pill in the bottom-right corner that opens a short
 * form and hands it to WhatsApp, the same way the contact page does. Bottom
 * right because the site guide owns the bottom-left. On the home page it waits
 * until the pinned hero film has scrolled past.
 */
export function ClientEnhancements() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef(false);
  const id = useId();

  useEffect(() => {
    const onScroll = () =>
      // The home hero is ~700vh because the film is pinned.
      setVisible(pathname !== '/' || window.scrollY > window.innerHeight * 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!visible) {
      setOpen(false);
      return;
    }
    // On the home page, open once per session when the visitor scrolls out of
    // the hero film — the moment the pill would otherwise only appear.
    if (pathname !== '/') return;
    try {
      if (sessionStorage.getItem('menaarc:quote-auto')) return;
      sessionStorage.setItem('menaarc:quote-auto', '1');
    } catch {}
    autoRef.current = true;
    setOpen(true);
  }, [visible, pathname]);

  useEffect(() => {
    if (!open) return;
    // Focus only when the visitor opened it: focusing on auto-open would
    // raise the phone keyboard mid-scroll.
    if (!autoRef.current) panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    autoRef.current = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = whatsappHref(composeMessage(new FormData(event.currentTarget), "I'd like a free quote."));
    const tab = window.open(href, '_blank');
    if (tab) tab.opener = null;
    else window.location.href = href;
  }

  if (!visible) return null;

  return (
    <div data-theme="light" className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <div
        ref={panelRef}
        id={`${id}-panel`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${id}-title`}
        hidden={!open}
        className="w-[min(23rem,calc(100vw-2rem))] origin-bottom-right animate-[quote-in_260ms_cubic-bezier(0.16,1,0.3,1)] overflow-y-auto rounded-3xl border border-[var(--hairline)] bg-[var(--ground)] p-6 text-[var(--figure)] shadow-[0_24px_60px_-12px_rgb(10_10_10/0.35)] motion-reduce:animate-none max-h-[calc(100svh-7rem)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="u-label">Free quote</p>
            <h2 id={`${id}-title`} className="mt-2 text-xl font-medium leading-tight">
              Tell us about your project
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            aria-label="Close quote form"
            className="-mr-2 -mt-1 rounded-full p-2 text-[var(--muted)] transition-colors hover:text-[var(--figure)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form
          action={`https://wa.me/${site.contact.whatsapp}`}
          method="get"
          target="_blank"
          onSubmit={onSubmit}
          className="mt-5 space-y-5"
        >
          <div>
            <label htmlFor={`${id}-name`} className="u-label">
              Name
            </label>
            <input id={`${id}-name`} name="name" required autoComplete="name" placeholder="Your name" className={FIELD} />
          </div>

          <fieldset>
            <legend className="u-label">Project type</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sector) => (
                <label key={sector} className="cursor-pointer">
                  <input type="radio" name="sector" value={sector} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-[color-mix(in_srgb,var(--figure)_22%,transparent)] px-3.5 py-1.5 text-sm transition-colors hover:border-[var(--figure)] peer-checked:border-[var(--figure)] peer-checked:bg-[var(--figure)] peer-checked:text-[var(--ground)] peer-focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]">
                    {sector}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${id}-brief`} className="u-label">
              Project details
            </label>
            <textarea
              id={`${id}-brief`}
              name="text"
              required
              rows={3}
              placeholder="Location, size, timeline…"
              className={`${FIELD} resize-none leading-relaxed`}
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--figure)] px-6 py-3.5 text-[var(--ground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
          >
            <WhatsAppIcon />
            Send on WhatsApp
          </button>
          <p className="text-center text-xs leading-snug text-[var(--muted)]">
            Opens WhatsApp with your message written out. Nothing is sent until you press send.
          </p>
        </form>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] py-3 pl-4 pr-5 text-[0.9375rem] font-medium text-white shadow-xl transition-transform hover:scale-105 motion-reduce:hover:scale-100"
      >
        <WhatsAppIcon className="h-6 w-6" />
        {open ? 'Close' : 'Get a free quote'}
      </button>
    </div>
  );
}
