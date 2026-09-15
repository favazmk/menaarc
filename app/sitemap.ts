import type { MetadataRoute } from 'next';

import { getAllProjects } from '@/lib/projects';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    // The root is already listed above; taking it from the nav as well would
    // emit `${site.url}/` as a second, trailing-slash copy of the same page.
    ...site.nav
      .filter((item) => item.href !== '/')
      .map((item) => ({
        url: `${site.url}${item.href}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
  ];

  const projects: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${site.url}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  return [...pages, ...projects];
}
