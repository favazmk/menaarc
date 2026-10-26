/**
 * The process, in one place because two components state it: the full
 * version on /services and the short form on the home page.
 *
 * Copy follows the client's "Design Process" poster word for word. Two
 * phases: design consultancy (six stages over five weeks, each with a
 * deliverable) and project delivery, which is appointed separately once the
 * design is complete.
 */

export type Stage = {
  n: string;
  title: string;
  /** When in the programme the stage runs, e.g. "Week 1". Design stages only. */
  when?: string;
  body: string;
  /** What the client has in hand at the end of the stage. Design stages only. */
  deliverable?: string;
};

export type Phase = {
  n: string;
  title: string;
  /** How long the phase runs, or how it is appointed. */
  term: string;
  intro: string;
  stages: readonly Stage[];
};

export const processIntro = {
  headline: 'A clear path from design to delivery.',
  lede: 'A clear design journey, with decisions made at the right time and drawings developed for the people who will build them.',
} as const;

export const design: Phase = {
  n: '01',
  title: 'Design consultancy',
  term: '5 weeks',
  intro: 'Six stages take the project from the initial brief to a coordinated design package.',
  stages: [
    {
      n: '01',
      title: 'Site Assessment',
      when: 'Week 1',
      body: 'Site review, project briefing and existing conditions.',
      deliverable: 'Confirmed brief and site assessment.',
    },
    {
      n: '02',
      title: 'Space Planning',
      when: 'Week 1',
      body: 'Functional zoning, circulation and layout development.',
      deliverable: 'Proposed plans for client approval.',
    },
    {
      n: '03',
      title: 'Concept Design',
      when: 'Week 2',
      body: 'Design direction, mood boards and initial 3D visuals.',
      deliverable: 'Concept presentation and 3D views.',
    },
    {
      n: '04',
      title: 'Design Development',
      when: 'Week 3',
      body: 'Revised visuals and architectural concept drawings.',
      deliverable: 'Architectural concept drawing package.',
    },
    {
      n: '05',
      title: 'Materials & Detailing',
      when: 'Weeks 3–4',
      body: 'Material selection, architectural details and finishes.',
      deliverable: 'Physical material board and detail drawings.',
    },
    {
      n: '06',
      title: 'MEP Design & Coordination',
      when: 'Weeks 4–5',
      body: 'Mechanical, electrical and plumbing design documentation.',
      deliverable: 'Coordinated MEP drawing package.',
    },
  ],
};

export const delivery: Phase = {
  n: '02',
  title: 'Project delivery',
  term: 'Separate',
  intro: 'From approvals to successful delivery.',
  stages: [
    { n: '01', title: 'Tendering & Procurement', body: 'Quantities, contractor pricing and tender review.' },
    { n: '02', title: 'Landlord & Authority Approvals', body: 'Authority, mall and landlord submissions.' },
    { n: '03', title: 'Project Management & Delivery', body: 'Programme, contractor oversight, quality, cost and time.' },
  ],
};
