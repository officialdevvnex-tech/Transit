import { PageHero } from '@/components/sections/PageHero';
import { ServiceSection } from '@/components/sections/ServiceSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { SERVICES } from '@/content/services';
import { FAQ, SITE } from '@/content/site';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Air, ocean and road freight, warehousing and customs brokerage on one network, with a delivery date we put in writing.';
export const metadata = pageMeta('Services: air, ocean, road, warehousing, customs', desc, '/services');

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd('WebPage', 'Services', desc, '/services'),
          ...SERVICES.map((s) => ({ '@context': 'https://schema.org', '@type': 'Service', name: `${s.title} ${s.emph}`, description: s.summary, provider: { '@type': 'Organization', name: SITE.name }, areaServed: 'Worldwide' })),
          { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
        ]}
      />
      <PageHero crumb="Services" title="Five ways to move *anything.*" intro="Air, ocean, road, warehousing and customs: built to work alone, designed to work together. Scroll, and watch the yard fill." />
      {SERVICES.map((s, i) => (
        <ServiceSection key={s.slug} s={s} i={i} />
      ))}
      <FaqSection />
      <NextStop beat={7} title="Ready to *move* something?" href="/quote" cta="Get a quote" sub="Tell us what, from where, to where. We come back with a mode, a price and a date." secondary={{ href: '/track', label: 'Or track a shipment' }} />
    </>
  );
}
