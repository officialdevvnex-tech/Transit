import { PageHero } from '@/components/sections/PageHero';
import { QuoteForm } from '@/components/sections/QuoteForm';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Request a freight quote in three short steps. Choose a mode and a lane, watch it draw on the planet, and get a delivery date, not a range.';
export const metadata = pageMeta('Get a quote', desc, '/quote');

export default function QuotePage() {
  return (
    <>
      <JsonLd data={webPageLd('WebPage', 'Get a quote', desc, '/quote')} />
      <PageHero crumb="Quote" title="Name the lane. *We’ll* name the date." intro="Three short steps. Pick the route and the planet draws it as you go." />
      <section data-chapter="Your request" className="veil-soft pb-[var(--section)] pt-24">
        <div className="wrap grid grid-cols-12 gap-x-4">
          <div className="col-span-12 lg:col-span-6 lg:col-start-1">
            <QuoteForm />
          </div>
          <aside className="col-span-12 mt-12 lg:col-span-6 lg:col-start-1" aria-label="What happens next">
            <p className="label mb-6">What happens next</p>
            <ol className="grid gap-8 border-t border-[var(--line)] pt-6 md:grid-cols-3">
              {[['Within 31 minutes', 'A person on the control tower reads your request and replies. Not a bot, not a queue.'], ['A date, not a range', 'You get a mode, a price and a delivery date we will put in writing.'], ['Move it', 'Accept, and your pickup is booked before the end of the day.']].map(([t, d], i) => (
                <li key={t} className="relative"><p className="label label-ink tnum">0{i + 1}</p><p className="display mt-1 text-[clamp(1.5rem,2vw,2rem)] leading-tight">{t}</p><p className="prose-body mt-2 text-[15px]">{d}</p></li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
      <NextStop title="Not ready? *Look around.*" href="/network" cta="Explore the network" sub="Drag the planet, pick a hub, see how the lanes connect." secondary={{ href: '/services', label: 'Read the services' }} />
    </>
  );
}
