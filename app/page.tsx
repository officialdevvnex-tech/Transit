import { HomeHero } from '@/components/sections/HomeHero';
import { StatsStrip } from '@/components/sections/StatsStrip';
import { AltitudeStory } from '@/components/sections/AltitudeStory';
import { ServiceRows } from '@/components/sections/ServiceRows';
import { PromiseSection } from '@/components/sections/PromiseSection';
import { IndustryRail } from '@/components/sections/IndustryRail';
import { CaseStudy } from '@/components/sections/CaseStudy';
import { NextStop } from '@/components/sections/NextStop';
import { Marquee } from '@/components/ui/Marquee';
import { VelocitySkew } from '@/components/ui/VelocitySkew';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMeta, webPageLd } from '@/lib/seo';
import { SITE } from '@/content/site';

export const metadata = {
  ...pageMeta('Every shipment, on time, everywhere', SITE.description, '/'),
  title: { absolute: `${SITE.name}: Every shipment, on time, everywhere` },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={webPageLd('WebPage', SITE.name, SITE.description, '/')} />
      <HomeHero />
      <div className="veil relative overflow-hidden border-y border-[var(--line)] py-6" aria-hidden>
        <VelocitySkew>
          <Marquee className="display text-[clamp(2.6rem,6vw,6rem)] leading-none" speed={70} items={['Air', 'Ocean', 'Road', 'Warehousing', 'Customs']} />
        </VelocitySkew>
      </div>
      <StatsStrip />
      <AltitudeStory />
      <ServiceRows />
      <PromiseSection />
      <IndustryRail />
      <CaseStudy />
      <NextStop beat={7} title="Get a quote that has a *date* on it." href="/quote" cta="Start a quote" sub="Three short steps. A person replies in about thirty minutes, with a delivery date, not a range." secondary={{ href: '/network', label: 'Explore the network' }} />
    </>
  );
}
