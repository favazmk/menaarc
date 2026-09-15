import { services, sectors } from '@/lib/services';
import { site } from '@/lib/site';

/**
 * JSON-LD for the practice. Only facts we can stand behind go in here —
 * a street address and opening hours are omitted rather than guessed, because
 * a wrong LocalBusiness record is worse than an incomplete one.
 */
export function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#organization`,
    name: site.legalName,
    alternateName: site.nameArabic,
    url: site.url,
    email: site.contact.email,
    telephone: site.contact.phoneHref,
    description: site.description,
    areaServed: [{ '@type': 'Country', name: 'United Arab Emirates' }],
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    founder: { '@type': 'Person', name: site.founder.name, jobTitle: site.founder.role },
    knowsAbout: [
      'Architecture',
      'Interior architecture',
      ...services.map((s) => s.title),
      ...sectors.map((s) => `${s} fit-out`),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Architectural services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.lede,
          serviceType: s.title,
          areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
        },
      })),
    },
    sameAs: site.social.map((s) => s.href),
  };

  // Every value above is a local constant, so there is no untrusted input here.
  // `<` is still escaped because JSON.stringify would happily emit a literal
  // `</script>` that closes this tag early — the one way static JSON-LD can
  // break out of its own script element.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
