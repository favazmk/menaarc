import { getProjectsByCity } from '@/lib/projects';
import { type CityProjects } from '@/components/ui/MenaGlobalMap';
import { GlobalExpertiseClient } from '@/components/sections/GlobalExpertiseClient';

export function GlobalExpertise() {
  const byCity = getProjectsByCity();
  const built: CityProjects[] = byCity.map(({ city, projects }) => ({
    city,
    projects: projects.map((p) => ({ slug: p.slug, title: p.title, location: p.location })),
  }));

  return <GlobalExpertiseClient built={built} />;
}
