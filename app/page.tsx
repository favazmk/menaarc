import { ScrollFilm } from '@/components/film/ScrollFilm';
import type { FilmManifest } from '@/components/film/useFrameLoader';
import type { Chapter } from '@/components/film/FilmChapters';
import { StudioIntro } from '@/components/sections/StudioIntro';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { Capabilities } from '@/components/sections/Capabilities';
import { Approach } from '@/components/sections/Approach';
import { ContactCta } from '@/components/sections/ContactCta';
import { getFeaturedProjects } from '@/lib/projects';

import manifestJson from '@/public/film/manifest.json';
import chaptersJson from '@/content/film-chapters.json';

const manifest = manifestJson as unknown as FilmManifest;
const chapters = chaptersJson.chapters as Chapter[];

export default function HomePage() {
  const featured = getFeaturedProjects(5);

  return (
    <>
      <ScrollFilm manifest={manifest} chapters={chapters} scrollLength={6} />
      <StudioIntro />
      <SelectedWork projects={featured} />
      <Capabilities />
      <Approach />
      <ContactCta />
    </>
  );
}
