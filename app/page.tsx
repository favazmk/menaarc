import { ScrollFilm } from '@/components/film/ScrollFilm';
import type { FilmManifest } from '@/components/film/useFrameLoader';
import type { Chapter } from '@/components/film/FilmChapters';
import { StudioIntro } from '@/components/sections/StudioIntro';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
import { ProcessPreview } from '@/components/sections/ProcessPreview';
import { ContactCta } from '@/components/sections/ContactCta';
import { getFeaturedProjects } from '@/lib/projects';

import manifestJson from '@/public/film/manifest.json';
import chaptersJson from '@/content/film-chapters.json';

const manifest = manifestJson as unknown as FilmManifest;
const chapters = chaptersJson.chapters as Chapter[];

/**
 * The home page is an index of the other pages, not a copy of them.
 *
 * Each section below is the short form of a page that carries the full
 * version, and ends in a link to it. Nothing here is the only place a thing
 * is said, and nothing here says all of it — which is what stops /services
 * and /studio reading as pages the visitor has already scrolled past.
 */
export default function HomePage() {
  const featured = getFeaturedProjects(5);

  return (
    <>
      <ScrollFilm manifest={manifest} chapters={chapters} scrollLength={6} />
      <StudioIntro />
      <SelectedWork projects={featured} />
      <ServicesPreview />
      <ProcessPreview />
      <ContactCta variant="home" />
    </>
  );
}
