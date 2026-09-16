import type { Metadata } from 'next';

import { ContactCta } from '@/components/sections/ContactCta';
import { WorkIndex } from '@/components/sections/WorkIndex';
import { getAllProjects, getSectors } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Retail, food and beverage and hospitality projects delivered across Dubai, Abu Dhabi and the wider UAE.',
};

export default function WorkPage() {
  return (
    <>
      <WorkIndex projects={getAllProjects()} sectors={getSectors()} />
      <ContactCta variant="work" />
    </>
  );
}
