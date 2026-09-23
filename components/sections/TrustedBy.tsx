import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

const AREA = 2704; // px²
const MIN_H = 18;
const MAX_H = 34;

type Client = (typeof site.clients)[number];

function Cell({ client }: { client: Client }) {
  const { name, file, w } = client;
  const aspect = w / 120;
  const height = Math.min(MAX_H, Math.max(MIN_H, Math.sqrt(AREA / aspect)));
  const mask = `url(/logos/${file}) no-repeat center / contain`;

  return (
    <li
      className="group relative flex h-20 sm:h-24 w-32 sm:w-48 shrink-0 items-center justify-center bg-[var(--ground)]"
    >
      <span className="sr-only">{name}</span>
      <span
        aria-hidden="true"
        className="block max-w-full opacity-55 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          width: `${height * aspect}px`,
          height: `${height}px`,
          backgroundColor: 'currentColor',
          mask,
          WebkitMask: mask,
        }}
      />
    </li>
  );
}

function MarqueeRow({ clients, reverse = false }: { clients: Client[]; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden">
      <ul className={`flex w-max shrink-0 gap-8 sm:gap-16 pr-8 sm:pr-16 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} hover:[animation-play-state:paused]`}>
        {[...clients, ...clients, ...clients, ...clients].map((client, i) => (
          <Cell key={`${client.name}-${i}`} client={client} />
        ))}
      </ul>
    </div>
  );
}

export function TrustedBy() {
  const row1 = site.clients.slice(0, 5);
  const row2 = site.clients.slice(5, 10);
  const row3 = site.clients.slice(10, 15);

  return (
    <section
      data-theme="light"
      className="border-y border-[var(--hairline)] bg-[var(--ground)] text-[var(--figure)] overflow-hidden"
    >
      <div className="u-shell py-16 md:py-20">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className="u-label">Design & Project Managed</p>
          <p className="text-[0.8125rem] text-[var(--muted)]">
            For landlords, operators and brands, from design intent to site delivery.
          </p>
        </Reveal>
      </div>

      <div className="pb-16 md:pb-20">
        <div className="flex flex-col gap-8 sm:gap-12">
          <Reveal delay={0}><MarqueeRow clients={row1} /></Reveal>
          <Reveal delay={150}><MarqueeRow clients={row2} reverse /></Reveal>
          <Reveal delay={300}><MarqueeRow clients={row3} /></Reveal>
        </div>
      </div>
    </section>
  );
}
