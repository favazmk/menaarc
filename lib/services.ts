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
  /** One line naming what the service covers. */
  sub: string;
  lede: string;
  /** The scope line under the description. */
  items: string[];
};

export const services: Service[] = [
  {
    id: 'design',
    title: 'Integrated Design & Technical Expertise',
    sub: 'Architecture, interiors, MEP design and technical documentation',
    lede: 'We develop architectural and interior design solutions supported by coordinated technical drawings, material specifications and MEP documentation.',
    items: ['Concept design', 'Spatial planning', '3D visualisation', 'Detailed design', 'MEP coordination'],
  },
  {
    id: 'approvals',
    title: 'Authority Approvals & Landlord Coordination',
    sub: 'Landlord submissions, NOCs, statutory approvals and permits',
    lede: 'We coordinate with mall management, landlords, their appointed consultants and relevant authorities to manage design reviews, technical submissions and required approvals.',
    items: ['Landlord technical review', 'NOCs', 'Authority submissions', 'Comment resolution', 'Permit coordination'],
  },
  {
    id: 'delivery',
    title: 'Project Management & Delivery',
    sub: 'Tendering, contractor coordination and construction-stage services',
    lede: 'We support project delivery through tendering, contractor coordination, progress monitoring, site inspections and handover coordination.',
    items: ['BOQs', 'Tender review', 'Programme monitoring', 'Site inspections', 'Snagging and handover'],
  },
];

/** Sectors the portfolio actually covers. Drives the contact form's chooser. */
export const sectors = ['Retail', 'F&B', 'Hospitality', 'Corporate', 'Residential'] as const;

/** How a sector reads on the page: the archive files restaurants as "F&B". */
export function sectorName(sector: string): string {
  return sector === 'F&B' ? 'Food & Beverage' : sector;
}
