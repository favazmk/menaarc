/**
 * Single source of truth for brand facts that appear in more than one place
 * (metadata, JSON-LD, footer, contact page). Edit here, not in components.
 */

export const site = {
  name: 'MENAARC',
  nameArabic: 'مينارك',
  legalName: 'MENAARC Architectural Consultants',
  tagline: 'Architectural Consultants',
  disciplines: ['Design', 'Project Management'] as const,
  description:
    'MENAARC is a Dubai architectural consultancy delivering design and project management for retail, hospitality and residential spaces across the UAE.',
  url: 'https://www.menaarc.com',
  locale: 'en-AE',
  region: 'Dubai, United Arab Emirates',

  contact: {
    email: 'rashidahamed@menaarc.com',
    phone: '+971 50 087 7781',
    phoneHref: '+971500877781',
  },

  founder: {
    name: 'Ar. Rashid Ahamed',
    role: 'Founder & CEO',
    instagram: 'https://www.instagram.com/ar.rashid.ahamed',
  },

  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/menaarcdesign' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/menaarc/' },
  ],

  nav: [
    { label: 'Work', href: '/work' },
    { label: 'Studio', href: '/studio' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export type Site = typeof site;
