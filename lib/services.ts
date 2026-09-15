/**
 * The service offer, in one place.
 *
 * Consumed by the capabilities section, the contact form's project-type
 * chooser and the JSON-LD offer catalogue, so the three can never drift apart.
 *
 * Scope detail is drawn from the delivery record behind the projects in
 * content/projects — UAE mall and F&B fit-out, where authority submissions and
 * MEP coordination are the parts that actually decide a programme.
 */

export type Service = {
  id: string;
  title: string;
  lede: string;
  items: string[];
};

export const services: Service[] = [
  {
    id: 'concept-creation',
    title: 'Concept Creation',
    lede: 'The stage where the decisions that cost nothing to change are made.',
    items: [
      'Brief development and feasibility',
      'Space planning and circulation',
      'Proportion and sightline studies',
      'Material and finish direction',
      'Lighting concept',
      '3D visualisation and mood boards',
    ],
  },
  {
    id: 'detailed-drawing',
    title: 'Detailed Drawing',
    lede: 'A set a contractor can build from without ringing to ask what you meant.',
    items: [
      'General arrangement and setting out',
      'Construction and junction details',
      'Joinery and shop drawings',
      'Material and finishes schedules',
      'Specification writing',
      'Tender documentation',
    ],
  },
  {
    id: 'authority-approvals',
    title: 'Authority Approvals',
    lede: 'The part of a programme that quietly decides whether the rest of it holds.',
    items: [
      'Dubai Municipality submissions',
      'Civil Defence approvals',
      'Mall and landlord NOCs',
      'Drawings prepared to authority standard',
      'Comment and revision handling',
      'Approvals run alongside design, not after it',
    ],
  },
  {
    id: 'mep-drawing',
    title: 'MEP Drawing',
    lede: 'Mechanical, electrical and plumbing drawn as infrastructure, not an afterthought.',
    items: [
      'Mechanical, electrical and plumbing layouts',
      'Load and capacity calculations',
      'Kitchen and back-of-house ventilation',
      'Routing coordinated against the architecture',
      'Clash resolution before anyone is on site',
      'Access planned for maintenance, not just installation',
    ],
  },
  {
    id: 'project-management',
    title: 'Project Management',
    lede: 'Someone accountable for the programme, the budget and the site.',
    items: [
      'Programme and cost planning',
      'Tendering and contractor selection',
      'Consultant and specialist coordination',
      'Site supervision',
      'Snagging and close-out',
      'Handover',
    ],
  },
];

/** Sectors the portfolio actually covers. Drives the contact form's chooser. */
export const sectors = ['Retail', 'F&B', 'Hospitality', 'Corporate', 'Residential'] as const;
