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
  headline: 'From first sketch to buildable detail.',
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
      title: 'Discovery & site',
      when: 'Week 1',
      body: 'Brief, site visit and review of existing conditions.',
      deliverable: 'Confirmed brief and site assessment.',
    },
    {
      n: '02',
      title: 'Space planning',
      when: 'Week 1',
      body: 'Zoning, circulation, furniture and kitchen layouts.',
      deliverable: 'Proposed plans for client approval.',
    },
    {
      n: '03',
      title: 'Concept design',
      when: 'Week 2',
      body: 'Mood boards, finishes, furniture, lighting and initial 3D.',
      deliverable: 'Concept presentation and 3D views.',
    },
    {
      n: '04',
      title: 'Design development',
      when: 'Week 3',
      body: 'Revised 3D, plans, elevations, sections, façade and RCP.',
      deliverable: 'Architectural concept drawing package.',
    },
    {
      n: '05',
      title: 'Materials & details',
      when: 'Weeks 3–4',
      body: 'Samples, finish selections, joinery and key details.',
      deliverable: 'Physical material board and detail drawings.',
    },
    {
      n: '06',
      title: 'MEP technical drawings',
      when: 'Weeks 4–5',
      body: 'Mechanical, electrical and plumbing design.',
      deliverable: 'Coordinated MEP drawing package.',
    },
  ],
};

export const delivery: Phase = {
  n: '02',
  title: 'Project delivery',
  term: 'Separate',
  intro: 'Appointed separately after design completion.',
  stages: [
    { n: '01', title: 'BOQ & tendering', body: 'Quantities, contractor pricing and tender review.' },
    { n: '02', title: 'Approvals', body: 'Authority, mall and landlord submissions.' },
    { n: '03', title: 'Project management', body: 'Programme, contractor oversight, quality, cost and time.' },
  ],
};
