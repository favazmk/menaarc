/**
 * Single source of truth for brand facts that appear in more than one place
 * (metadata, JSON-LD, footer, contact page). Edit here, not in components.
 */

export const site = {
  name: 'MENAARC',
  /** Plain, for metadata and JSON-LD — the form a search or a screen reader wants. */
  nameArabic: 'مينارك',
  /**
   * The wordmark lockup's Arabic, with kashida (U+0640) between the joining
   * letters, exactly as the supplied logo draws it.
   *
   * Arabic is cursive, so CSS letter-spacing is the wrong tool for the airy
   * tracking the mark wants — it inserts gaps that sever the joins. Kashida is
   * the typographic device the script actually has for this, and U+0640 is
   * ignorable, so the accessible name still reads as the studio's name.
   */
  nameArabicLockup: 'مـيـنـــارك',
  legalName: 'MENAARC Architectural Consultants',
  tagline: 'Architectural Consultants',
  disciplines: [
    'Concept Creation',
    'Detailed Drawing',
    'Authority Approvals',
    'MEP Drawing',
    'Project Management',
  ] as const,
  description:
    'MENAARC is a Dubai architectural consultancy: concept creation, detailed drawing, authority approvals, MEP drawing and project management for retail, F&B, hospitality and residential projects across the UAE.',
  url: 'https://www.menaarc.com',
  locale: 'en-AE',
  region: 'Dubai, United Arab Emirates',

  contact: {
    email: 'rashidahamed@menaarc.com',
    phone: '+971 50 087 7781',
    phoneHref: '+971500877781',
    /** The same number in the digits-only form wa.me expects: no +, no spaces. */
    whatsapp: '971500877781',
  },

  founder: {
    name: 'Ar. Rashid Ahamed',
    role: 'Founder & CEO',
    linkedin: 'https://www.linkedin.com/in/ar-rashid-ahamed-b7a8a59a/?skipRedirect=true',
    linkedinLabel: 'LinkedIn',
  },

  /**
   * The people the studio puts its name behind.
   *
   * `founder` above stays as-is because metadata and JSON-LD reference it;
   * this is the list /studio renders. Each entry is a claim about a real
   * person, so nothing here is written for effect — every credential below is
   * one the person publishes about themselves.
   */
  leadership: [
    {
      name: 'Ar. Rashid Ahamed',
      role: 'Founder & CEO',
      bio: 'Rashid brings over a decade of experience in the UAE, leading design and delivery for global retail and hospitality brands. He founded MENAARC to keep architecture and execution under one roof, ensuring that thoughtful design is always met with rigorous project management and cost control.',
      credentials: [
        'Over a decade of experience in Dubai and the GCC',
        'Led design and delivery for global brands (Tim Hortons, Tommy Hilfiger, Levi\'s)',
        'Expertise in architectural design, cost control, and MEP coordination',
        'Former Lead Architect at Tim Hortons and Maristo Hospitality',
      ],
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ar-rashid-ahamed-b7a8a59a/?skipRedirect=true' },
      ],
    },
    {
      name: 'Benazir Noor Mohamed',
      role: 'Cofounder',
      bio: 'Benazir brings over a decade in the built environment — design, execution and the performance of a building once it is occupied. Her work joins design intent to operational rigour, so that wellbeing-driven decisions are measurable rather than asserted.',
      credentials: [
        'Over a decade in the built environment',
        'Mentored by Pritzker Laureate B. V. Doshi',
        'Advisory board, International WELL Building Institute',
        'Advanced studies, University College London',
      ],
      links: [
        {
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/benazir-noor-mohamed-5b477870/',
        },
      ],
    },
  ],

  /**
   * The regional claim and the numbers behind it.
   *
   * These come from the group the studio belongs to, not from this site's own
   * project archive — /work publishes a subset. Keep the two consistent: if a
   * number here changes, the copy on /studio that characterises the practice
   * has to be checked against it.
   */
  established: 2019,

  stats: [
    { value: '6+', label: 'Years of Experience' },
    { value: '200+', label: 'Projects Completed' },
    { value: '100+', label: 'Passionate Professionals' },
    { value: '40+', label: 'Brands Delivered' },
  ],

  expertise: [
    { term: 'Established', value: '2019' },
    { term: 'Experience', value: '40+ years of combined expertise across the leadership team' },
    { term: 'Specialisation', value: 'F&B, Retail, Hospitality, Corporate and Residential' },
    { term: 'Reach', value: 'The UAE and the wider GCC, with ongoing expansion across MENA' },
    { term: 'Approach', value: 'End-to-end in-house capability — from concept to completion' },
  ],

  /**
   * The client wall. Order is deliberate: mall operators and landlords first,
   * then the brands whose units the studio has drawn — the sequence a visitor
   * from this industry reads as "who lets them work, and for whom".
   */
  clients: [
    { name: 'Majid Al Futtaim', file: 'majid-al-futtaim.png', w: 546 },
    { name: 'Emaar', file: 'emaar.png', w: 606 },
    { name: 'Al Ghurair', file: 'al-ghurair.png', w: 243 },
    { name: 'BurJuman', file: 'burjuman.png', w: 564 },
    { name: 'Abu Dhabi Mall', file: 'abu-dhabi-mall.png', w: 182 },
    { name: 'Sahara Centre', file: 'sahara-centre.png', w: 165 },
    { name: 'Expo 2020 Dubai', file: 'expo-2020-dubai.png', w: 226 },
    { name: 'Jack & Jones', file: 'jack-and-jones.png', w: 1036 },
    { name: 'MAX&Co.', file: 'max-and-co.png', w: 720 },
    { name: 'Pandora', file: 'pandora.png', w: 584 },
    { name: "Peet's Coffee", file: 'peets-coffee.png', w: 547 },
    { name: "Rosa's Thai", file: 'rosas-thai.png', w: 250 },
    { name: 'Bateel', file: 'bateel.png', w: 279 },
    { name: 'Tortilla', file: 'tortilla.png', w: 341 },
    { name: "Papa John's", file: 'papa-johns.png', w: 283 },
  ],

  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/menaarcdesign' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/menaarc/' },
  ],

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Work', href: '/work' },
    { label: 'Studio', href: '/studio' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export type Site = typeof site;
