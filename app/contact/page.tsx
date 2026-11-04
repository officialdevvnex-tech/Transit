import { PageHero } from '@/components/sections/PageHero';
import { ContactSection } from '@/components/sections/ContactSection';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { OFFICES, SITE } from '@/content/site';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Talk to the TransitArc control tower. Four hubs, one number that gets answered in under four rings.';
export const metadata = pageMeta('Contact', desc, '/contact');

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[webPageLd('ContactPage', 'Contact TransitArc', desc, '/contact'), ...OFFICES.map((o) => ({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: `${SITE.name}, ${o.city}`, address: o.address, telephone: o.phone }))]} />
      <PageHero crumb="Contact" title="Pick up the *phone.*" intro={`A person answers: ${SITE.phone}. Or write to us below and the control tower replies within the hour.`} />
      <ContactSection />
      <NextStop title="Rather just *start?*" href="/quote" cta="Get a quote" sub="Three steps, thirty minutes to a reply." secondary={{ href: '/track', label: 'Track a shipment' }} />
    </>
  );
}
