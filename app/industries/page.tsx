import { PageHero } from '@/components/sections/PageHero';
import { IndustryList } from '@/components/sections/IndustryList';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Freight built around your cargo: automotive, life sciences, retail, energy, technology and fresh food.';
export const metadata = pageMeta('Industries we move for', desc, '/industries');

export default function IndustriesPage() {
  return (
    <>
      <JsonLd data={webPageLd('CollectionPage', 'Industries', desc, '/industries')} />
      <PageHero crumb="Industries" title="Your cargo *isn’t* generic." intro="A turbine, a vaccine and a pallet of trainers want three different kinds of care. We hire, certify and plan for each." />
      <IndustryList />
      <NextStop beat={7} title="Who’s *behind* all this?" href="/about" cta="Meet the company" sub="Fourteen years, 31,000 colleagues, one stubborn idea about dates." secondary={{ href: '/quote', label: 'Get a quote' }} />
    </>
  );
}
