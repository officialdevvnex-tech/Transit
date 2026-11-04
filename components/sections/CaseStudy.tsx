'use client';

import { useEffect, useRef } from 'react';
import { SplitText } from '@/components/ui/SplitText';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useStore } from '@/lib/store';

/** Case study. While it is on screen the planet draws the actual lane: Rotterdam → Singapore. */
export function CaseStudy() {
  const root = useRef<HTMLElement>(null);
  const setLane = useStore((s) => s.setLane);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLane(e.isIntersecting ? { from: 'RTM', to: 'SIN' } : null), { rootMargin: '-35% 0px -35% 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      setLane(null);
    };
  }, [setLane]);

  return (
    <section ref={root} data-chapter="Case file" data-beat="6" className="beat veil-soft">
      <div className="wrap w-full">
        <div className="panel max-w-[620px] p-7 md:p-10">
          <p className="label mb-6 flex items-center gap-4">
            <span className="label-ink tnum">06 <span className="text-muted">/ 06</span></span>
            <span className="rule max-w-[56px]" /> Case file · Life sciences
          </p>
          <SplitText as="h2" text="Rotterdam to Singapore, *41 hours* faster." className="display text-[clamp(2.4rem,4.6vw,4.8rem)] leading-[0.94]" />
          <p className="prose-body mt-6">
            A heatwave threatened 18 pallets of biologics at a 41°C transhipment hub. We moved the handoff to a powered berth, added a cold dolly for the 70-metre walk to the aircraft, and booked an air bridge for the last leg. The loggers never read above 6.8°C.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6">
            {[['−41 h', 'door to door'], ['6.8°C', 'peak logged'], ['0', 'deviations']].map(([v, l]) => (
              <div key={l}>
                <dt className="display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none tnum">{v}</dt>
                <dd className="label mt-2">{l}</dd>
              </div>
            ))}
          </dl>
          <TransitionLink href="/blog/cold-chain-in-a-heatwave" className="label label-ink u-draw mt-8 inline-block py-2" data-cursor="label" data-cursor-label="Read">
            Read the full case →
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
