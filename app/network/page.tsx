import { NetworkExplorer } from '@/components/sections/NetworkExplorer';
import { NextStop } from '@/components/sections/NextStop';
import { Reveal } from '@/components/ui/Reveal';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { JsonLd } from '@/components/ui/JsonLd';
import { LANES, hubById } from '@/lib/geo';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Explore the TransitArc network: 16 hubs, 24 trunk lanes across air, ocean and road. Drag the planet, filter by mode, fly to any hub.';
export const metadata = pageMeta('Network: hubs and lanes', desc, '/network');

export default function NetworkPage() {
  return (
    <>
      <JsonLd data={webPageLd('WebPage', 'Network', desc, '/network')} />
      <section className="relative flex min-h-[100svh] flex-col justify-between pb-10 pt-[calc(var(--nav-h)+40px)]" data-chapter="The planet">
        <div className="wrap pointer-events-none">
          <p className="label mb-6 flex items-center gap-4"><span className="label-ink">TransitArc</span><span className="rule max-w-[56px]" /> Network</p>
          <h1 className="sr-only">One planet. One map.</h1>
        </div>
        <NetworkExplorer />
      </section>

      <section data-chapter="Trunk lanes" className="veil py-[var(--section)]">
        <div className="wrap">
          <p className="label mb-10 flex items-center gap-4"><span className="label-ink tnum">24 lanes</span><span className="rule max-w-[56px]" /> The trunk network</p>
          <ul className="border-t border-[var(--line)]">
            {LANES.map((l, i) => (
              <Reveal as="li" key={i} className="grid grid-cols-12 items-baseline gap-x-4 border-b border-[var(--line)] py-4 transition-colors hover:bg-white/[0.02]">
                <span className="label tnum col-span-2 md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                <span className="display col-span-10 text-[clamp(1.6rem,3.2vw,3rem)] leading-none md:col-span-6">{hubById(l.from)!.name} <em>→</em> {hubById(l.to)!.name}</span>
                <span className="label col-span-6 col-start-3 mt-2 md:col-span-3 md:col-start-8 md:mt-0">{l.mode === 'sea' ? 'Ocean' : l.mode === 'air' ? 'Air' : 'Road'}</span>
                <span className="label col-span-4 mt-2 text-right md:col-span-2 md:mt-0">{l.from}–{l.to}</span>
              </Reveal>
            ))}
          </ul>
          <p className="prose-body mt-10 text-[15px]">Plus 600+ feeder lanes. <TransitionLink href="/contact" className="u-draw text-ink">Ask about a specific corridor.</TransitionLink></p>
        </div>
      </section>
      <NextStop title="Whose cargo is *it?*" href="/industries" cta="See industries" sub="Different cargo, different care. Here is how we staff for it." secondary={{ href: '/quote', label: 'Get a quote' }} />
    </>
  );
}
