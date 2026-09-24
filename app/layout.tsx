import type { Metadata, Viewport } from 'next';
import { Archivo, Bricolage_Grotesque, Noto_Kufi_Arabic } from 'next/font/google';

import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { ClientEnhancements } from '@/components/layout/ClientEnhancements';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Cursor } from '@/components/ui/Cursor';
import { StructuredData } from '@/components/brand/StructuredData';
import { site } from '@/lib/site';

import './globals.css';

// next/font downloads these at build time and serves them from our own origin,
// so there is no third-party request on the critical path.
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['opsz'],
});

// The Arabic half of the lockup. Measured against the supplied artwork glyph by
// glyph (kaf, ra, meem, each normalised and scored by pixel overlap), Noto Kufi
// Arabic is among the closest shipping faces, and it is the right family in
// principle: a kufi geometric to sit under a squared geometric Latin.
//
// The weight matters more than the family did. The artwork's Arabic has a
// stroke-to-height ratio of 0.17 — the same as its Latin — which is a Medium.
// This shipped at 200/300 and read as a different, lighter logo.
const kufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-kufi-arabic',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}, Dubai`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'architectural consultants Dubai',
    'architecture studio UAE',
    'interior fit-out design Dubai',
    'project management Dubai',
    site.name,
  ],
  authors: [{ name: site.legalName }],
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'light',
};

const RELOAD_TO_TOP = `try {
  var nav = performance.getEntriesByType('navigation')[0];
  if (sessionStorage.getItem('menaarc:reset')) {
    sessionStorage.removeItem('menaarc:reset');
  } else if (nav && nav.type === 'reload') {
    // Reload again as a plain navigation, even on the home page: the browser
    // does not restore a scroll position into a navigation, whereas turning
    // restoration off during a reload proved unreliable. The flag stops a
    // same-URL replace that the browser also counts as a reload from looping.
    history.scrollRestoration = 'manual';
    sessionStorage.setItem('menaarc:reset', '1');
    location.replace('/');
  }
} catch (e) {}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${bricolage.variable} ${kufiArabic.variable}`}>
      <head>
        {/* A refresh always starts over from the top of the home page, as a
            first visit would. Inline and in <head> so it runs while the HTML is
            still parsing: before the browser restores the old scroll position,
            and before the page being left has painted. */}
        <script dangerouslySetInnerHTML={{ __html: RELOAD_TO_TOP }} />
      </head>
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--figure)] focus:px-4 focus:py-2 focus:text-[var(--ground)]"
        >
          Skip to content
        </a>
        <StructuredData />
        <SmoothScroll />
        <ClientEnhancements />
        <Cursor />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
