/**
 * A chat bubble with a handset in it — the shape people read as "WhatsApp"
 * without reproducing the trademarked glyph. Drawn in currentColor so it takes
 * the colour of whatever button it sits in.
 */
export function WhatsAppIcon({ className = 'h-[1.1em] w-[1.1em]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.1 8.2c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c-.1.1-.1.3 0 .5.6 1.1 1.4 1.9 2.5 2.5.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .6-.4.8-.6.4-1.4.6-2.2.4-2.6-.7-4.6-2.7-5.3-5.3-.2-.8 0-1.6.2-2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
