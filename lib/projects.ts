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
