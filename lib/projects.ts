import fs from 'node:fs';
import path from 'node:path';

export type ProjectStatus = 'pending-client-approval' | 'approved';

export type Project = {
  slug: string;
  title: string;
  /** The heading exactly as it appears on the source page, kept for auditing. */
  headingAtSource: string;
  client: string;
  location: string;
  sector: string;
  year: string;
  area: string;
  scope: string[];
  photographer: string;
  summary: string;
  body: string[];
  images: string[];
  featured: boolean;
  status: ProjectStatus;
  source: { url: string; ingestedAt: string };
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');

/**
 * Reads every project record from disk.
 *
 * Runs at build time only. Records are sorted by image count so the projects
 * with real photography lead the index — the archive is uneven, and a case
 * study with one surviving image should not open the page.
 */
export function getAllProjects(): Project[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')) as Project)
    .filter((p) => p.images.length > 0)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.images.length - a.images.length;
    });
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

/** Projects for the home page's selected-work band. */
export function getFeaturedProjects(limit = 5): Project[] {
  return getAllProjects().slice(0, limit);
}

/** Distinct sectors present in the archive, for the index filter. */
export function getSectors(): string[] {
  return [...new Set(getAllProjects().map((p) => p.sector).filter(Boolean))].sort();
}

/** Adjacent project, for the next-project link at the foot of a case study. */
export function getNextProject(slug: string): Project | undefined {
  const all = getAllProjects();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return undefined;
  return all[(i + 1) % all.length];
}

export function pendingApproval(): Project[] {
  return getAllProjects().filter((p) => p.status !== 'approved');
}

/**
 * Which city each recorded location sits in.
 *
 * The archive records the mall, because that is what the client and the
 * landlord call the job — "Ibn Batuta Mall", not "Dubai". The map needs the
 * city, so the translation lives here rather than in the map component: it is a
 * fact about the archive, and anything that groups projects geographically
 * should get the same answer.
 *
 * A location that is not listed here simply has no city, and its project is
 * left off the map rather than guessed at.
 */
const CITY_BY_LOCATION: Record<string, string> = {
  'Ibn Batuta Mall': 'Dubai',
  'Ibn Batuta': 'Dubai',
  'Deira City Center': 'Dubai',
  'Dubai Hills Mall': 'Dubai',
  JBR: 'Dubai',
  'Burjman Mall': 'Dubai',
  'Ajman City Center': 'Ajman',
  'Abu Dhabi': 'Abu Dhabi',
  'Yas Mall, Abu Dhabi': 'Abu Dhabi',
};

/**
 * Published projects grouped by city, biggest first.
 *
 * This is what makes a pin on the region map a claim the archive can back:
 * a city is marked as delivered because projects resolve to it here, not
 * because someone typed it into a list.
 */
export function getProjectsByCity(): { city: string; projects: Project[] }[] {
  const byCity = new Map<string, Project[]>();

  for (const project of getAllProjects()) {
    const city = CITY_BY_LOCATION[project.location];
    if (!city) continue;
    byCity.set(city, [...(byCity.get(city) ?? []), project]);
  }

  return [...byCity.entries()]
    .map(([city, projects]) => ({ city, projects }))
    .sort((a, b) => b.projects.length - a.projects.length || a.city.localeCompare(b.city));
}

export type ArchiveSummary = {
  /** Published projects — those with at least one surviving image. */
  total: number;
  /** Project count per sector, most-delivered first. */
  bySector: Array<{ sector: string; count: number }>;
};

/**
 * What the published archive actually contains.
 *
 * The studio page states this out loud, so it is computed rather than typed
 * into the copy: a number written by hand goes stale the first time a project
 * is added, and a studio page that overstates its own portfolio is the exact
 * thing a prospective client checks against /work.
 */
export function getArchiveSummary(): ArchiveSummary {
  const all = getAllProjects();
  const counts = new Map<string, number>();

  for (const p of all) {
    if (p.sector) counts.set(p.sector, (counts.get(p.sector) ?? 0) + 1);
  }

  return {
    total: all.length,
    bySector: [...counts.entries()]
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count || a.sector.localeCompare(b.sector)),
  };
}

/**
 * The photograph a full-bleed parallax band uses for a project.
 *
 * Bands show one image edge to edge at viewport width, so they need more pixels
 * than the 1800px cap optimize-images.mjs applies to the archive. A band file
 * in public/bands/ is prepared separately, from the original in
 * assets/projects-original/ (or an upscale where the original itself is small),
 * and falls back to the project's lead image when there isn't one.
 */
export function getBandImage(project: Project): string {
  const band = path.join(process.cwd(), 'public', 'bands', `${project.slug}.webp`);
  return fs.existsSync(band) ? `/bands/${project.slug}.webp` : project.images[0];
}
