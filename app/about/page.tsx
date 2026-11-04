import { PageHero } from '@/components/sections/PageHero';
import { Manifesto, Timeline, Values, People } from '@/components/sections/AboutSections';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'TransitArc was founded in Rotterdam in 2011 on one idea: the delivery date is the product. Meet the company, the history and the people on call.';
export const metadata = pageMeta('About TransitArc', desc, '/about');

export default function AboutPage() {
  return (
    <>
      <JsonLd data={webPageLd('AboutPage', 'About TransitArc', desc, '/about')} />
      <PageHero crumb="About" title="We built a company around *the day.*" intro="Fifteen years, 31,000 colleagues, 140 countries and one stubborn idea about dates." />
      <Manifesto />
      <Timeline />
      <Values />
      <People />
      <NextStop beat={5} title="Want to help us *keep* it?" href="/careers" cta="See open roles" sub="Six open roles across four continents, and always room for a good dispatcher." secondary={{ href: '/contact', label: 'Say hello' }} />
    </>
  );
}
