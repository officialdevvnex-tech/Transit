import { Suspense } from 'react';
import { PageHero } from '@/components/sections/PageHero';
import { TrackView } from '@/components/sections/TrackView';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Track any TransitArc shipment across air, ocean and road. One ID, one live map, milestones that mean the same thing in every mode.';
export const metadata = pageMeta('Track a shipment', desc, '/track');

export default function TrackPage() {
  return (
    <>
      <JsonLd data={webPageLd('WebPage', 'Track a shipment', desc, '/track')} />
      <PageHero crumb="Track" title="Where is it, *exactly?*" intro="Paste a tracking ID. The planet will turn to your cargo and show you the next three things that will happen to it." />
      <section data-chapter="Shipment" className="veil-soft pb-[var(--section)] pt-24">
        <Suspense fallback={<div className="wrap"><div className="skeleton h-24 w-full max-w-[640px]" /></div>}>
          <TrackView />
        </Suspense>
      </section>
      <NextStop title="Moving something *new?*" href="/quote" cta="Get a quote" sub="A person replies with a date, usually inside half an hour." secondary={{ href: '/network', label: 'See the network' }} />
    </>
  );
}
