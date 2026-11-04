'use client';

import { INDUSTRIES } from '@/content/industries';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SplitText } from '@/components/ui/SplitText';

/** The showroom is the visual; this is just the caption. Six objects hang in 3D behind it. */
export function IndustryRail() {
  return (
    <section data-chapter="Industries" data-beat="5" className="beat veil-soft items-end !pb-[10vh]">
      <div className="wrap w-full">
        <p className="label mb-6 flex items-center gap-4">
          <span className="label-ink tnum">05 <span className="text-muted">/ 06</span></span>
          <span className="rule max-w-[72px]" /> Who we move for
        </p>
        <SplitText as="h2" text="Cargo has a *personality.*" className="display shadow-text t-h2 max-w-[14ch]" />
        <p className="prose-body shadow-text mt-6 max-w-[48ch]">A transformer, a vaccine and a pallet of trainers need three kinds of care. We staff for the cargo, not the mode.</p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <li key={ind.slug}>
              <TransitionLink href={`/industries#${ind.slug}`} data-cursor="label" data-cursor-label="Go" className="label panel block rounded-full px-5 py-3 transition-colors hover:border-signal hover:text-ink">
                {ind.name}
              </TransitionLink>
            </li>
          ))}
        </ul>
        <div className="mt-8"><MagneticButton href="/industries" variant="ghost">See all industries</MagneticButton></div>
      </div>
    </section>
  );
}
