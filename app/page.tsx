import { ScrollFilm } from '@/components/film/ScrollFilm';
import type { FilmManifest } from '@/components/film/useFrameLoader';
import type { Chapter } from '@/components/film/FilmChapters';
import { StudioIntro } from '@/components/sections/StudioIntro';
import { TrustedBy } from '@/components/sections/TrustedBy';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { GlobalExpertise } from '@/components/sections/GlobalExpertise';
import { Stats } from '@/components/sections/Stats';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
import { ProcessPreview } from '@/components/sections/ProcessPreview';
import { ContactCta } from '@/components/sections/ContactCta';
import { SiteGuide } from '@/components/ui/SiteGuide';
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
 *
 * THE ORDER IS THE ARGUMENT.
 *
 * A visitor arrives not knowing whether this studio is real, and every claim a
 * studio makes about itself is worth less than one other people make about it.
 * So the page earns the right to talk about itself before it does:
 *
 *   1. Film           a promise, and a reason to keep scrolling
 *   2. Trusted by     other people's names first — Emaar and Majid Al Futtaim
 *                     let these people onto their sites. Borrowed credibility
 *                     before a single self-description.
 *   3. Selected work  the evidence for it. Photographs of finished units.
 *   4. Stats          the scale of what was just shown. Kept on the same ink
 *                     ground as the work deliberately: read directly under five
 *                     projects, "200+" is a caption, not a boast in isolation.
 *   5. The studio     only now — with attention earned — what makes it
 *                     different, which is the part a stranger would discount.
 *   6. The region     "can you do this where I am?", the first real objection.
 *   7. Services       "what exactly would you do?", the second.
 *   8. Process        "how will this go?" — the fear behind both, answered by
 *                     showing the sequence before anyone has to ask.
 *   9. Contact        an invitation that costs the visitor nothing, which is
 *                     the only close that does not undo the preceding eight.
 *
 * Claims about the studio sit downstream of evidence for them throughout. Any
 * reordering that puts a self-description above the client wall or the archive
 * hands a stranger an assertion before a reason to believe it.
 */
export default function HomePage() {
  const featured = getFeaturedProjects(5);

  return (
    <>
      <ScrollFilm manifest={manifest} chapters={chapters} scrollLength={6} />

      {/* `data-guide` marks a stop on the guide's route, and its value keys the
          line she says there (see SiteGuide's STOPS). The film carries no
          marker, which is what keeps her off it. Plain wrappers rather than a
          prop on each section, because the route belongs to this page — most of
          these sections also appear on pages the guide never visits. */}
      <div data-guide="clients">
        <TrustedBy />
      </div>
      <div data-guide="work">
        <SelectedWork projects={featured} />
      </div>
      <div data-guide="stats">
        <Stats />
      </div>
      <div data-guide="studio">
        <StudioIntro />
      </div>
      <div data-guide="region">
        <GlobalExpertise />
      </div>
      <div data-guide="services">
        <ServicesPreview />
      </div>
      <div data-guide="process">
        <ProcessPreview />
      </div>
      <div data-guide="contact">
        <ContactCta variant="home" />
      </div>

      <SiteGuide />
    </>
  );
}
