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
 * So the page opens on other people and widens out before it narrows to a
 * single unit:
 *
 *   1. Film           a promise, and a reason to keep scrolling
 *   2. Trusted by     other people's names first — Emaar and Majid Al Futtaim
 *                     let these people onto their sites. Borrowed credibility
 *                     before a single self-description.
 *   3. The region     where that work happens, answering "can you do this
 *                     where I am?" while the client wall is still in view.
 *   4. Stats          the scale of it — territory, then the count inside the
 *                     territory, which is the order those two facts support
 *                     each other in.
 *   5. Selected work  the payoff, and the proof. Photographs of finished
 *                     units, arriving after the reach and the count have set
 *                     the expectation they have to meet.
 *   6. The studio     only now — with attention earned — what makes it
 *                     different, which is the part a stranger would discount.
 *   7. Services       "what exactly would you do?"
 *   8. Approach       "how will this go?" — the fear behind it, answered by
 *                     showing the sequence before anyone has to ask.
 *   9. Contact        an invitation that costs the visitor nothing, which is
 *                     the only close that does not undo the preceding eight.
 *
 * The run from 2 to 5 is a single movement from widest to narrowest: other
 * people's names, then the map, then the count, then one photographed unit.
 * Anything inserted into that run breaks the funnel. Self-description still
 * sits downstream of all of it, which is the part that must not move.
 *
 * The guide's route in SiteGuide reads this order — reordering here means
 * re-walking its `side`/`lift` cycle, and re-reading any line that refers to
 * the section before or after it.
 */
export default function HomePage() {
  const featured = getFeaturedProjects(5);

  return (
    <>
      <ScrollFilm manifest={manifest} chapters={chapters} scrollLength={6} />

      {/* `data-guide` marks a stop on the guide's route, and its value keys the
          line it says there (see SiteGuide's STOPS). The film carries no
          marker, which is what keeps it off the film. Plain wrappers rather than a
          prop on each section, because the route belongs to this page — most of
          these sections also appear on pages the guide never visits. */}
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
      <div data-guide="studio">
        <StudioIntro />
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
