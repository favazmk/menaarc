import { ScrollFilm } from '@/components/film/ScrollFilm';
import type { FilmManifest } from '@/components/film/useFrameLoader';
import type { Chapter } from '@/components/film/FilmChapters';
import { HomeIntro } from '@/components/sections/HomeIntro';
import { TrustedBy } from '@/components/sections/TrustedBy';
import { GlobalExpertise } from '@/components/sections/GlobalExpertise';
import { Stats } from '@/components/sections/Stats';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { ContactCta } from '@/components/sections/ContactCta';
import { SiteGuide } from '@/components/ui/SiteGuide';
import { getFeaturedProjects } from '@/lib/projects';

import manifestJson from '@/public/film/manifest.json';
import chaptersJson from '@/content/film-chapters.json';

const manifest = manifestJson as unknown as FilmManifest;
const chapters = chaptersJson.chapters as Chapter[];

/**
 * The home page is a curated introduction to the studio, not a condensed copy
 * of every other page. The studio, its five services and the design process
 * each have a page of their own; here they get at most a line.
 *
 * THE ORDER IS THE ARGUMENT.
 *
 *   1. Film           a promise, and a reason to keep scrolling
 *   2. Introduction   who MENAARC is, in one paragraph — the sectors and the
 *                     in-house disciplines folded in as single lines
 *   3. Trusted by     other people's names: borrowed credibility before any
 *                     more self-description
 *   4. The region     where that work happens, in a single screen
 *   5. Stats          the scale of it
 *   6. Selected work  the centrepiece: photographs of finished units, as a
 *                     slideshow
 *   7. Contact        an invitation that costs the visitor nothing
 *
 * The guide perches on whichever section heading is in view, so reordering
 * needs no change to SiteGuide beyond re-reading any line it says that refers
 * to the section before or after it.
 */
export default function HomePage() {
  const featured = getFeaturedProjects(8).map(({ slug, title, location, sector, images }) => ({
    slug,
    title,
    location,
    sector,
    images,
  }));

  return (
    <>
      <ScrollFilm manifest={manifest} chapters={chapters} scrollLength={6} />

      {/* `data-guide` marks a stop on the guide's route, and its value keys the
          line it says there (see SiteGuide's STOPS). The film carries no
          marker, which is what keeps it off the film. Plain wrappers rather than a
          prop on each section, because the route belongs to this page — most of
          these sections also appear on pages the guide never visits. */}
      {/* The guide's route: it perches on the h2 headings inside, and never on
          the film's own titles above. */}
      <div data-guide-route>
        <div data-guide="intro">
          <HomeIntro />
        </div>
        <div data-guide="clients">
          <TrustedBy />
        </div>
        <div data-guide="region">
          <GlobalExpertise />
        </div>
        <div data-guide="stats">
          <Stats />
        </div>
        <div data-guide="work">
          <SelectedWork projects={featured} />
        </div>
        <div data-guide="contact">
          <ContactCta variant="home" />
        </div>
      </div>

      <SiteGuide />
    </>
  );
}
