'use client';

import { INDUSTRIES } from '@/content/industries';
import { SplitText } from '@/components/ui/SplitText';
import { Reveal } from '@/components/ui/Reveal';

/** Six plinths in the showroom, six stops. The object hangs in 3D; the panel is the caption. */
export function IndustryList() {
  return (
    <>
      {INDUSTRIES.map((ind, i) => (
        <section key={ind.slug} id={ind.slug} data-beat={i + 1} data-chapter={ind.name} className="beat">
          <div className="wrap flex w-full justify-end">
            <Reveal variant="plate" className="panel w-full p-7 md:max-w-[500px] md:p-9">
              <p className="label mb-6 flex items-center gap-4"><span className="label-ink tnum">{ind.n} <span className="text-muted">/ 06</span></span><span className="rule max-w-[40px]" />{ind.proof.l}</p>
              <SplitText as="h2" text={ind.name.replace(/(\S+)$/, '*$1*')} className="display text-[clamp(2.4rem,4.2vw,4.2rem)] leading-[0.94]" />
              <p className="display mt-5 text-[clamp(1.25rem,1.7vw,1.6rem)] leading-[1.1]">{ind.line}</p>
              <p className="prose-body mt-4 text-[15.5px]">{ind.detail}</p>
              <p className="display mt-6 text-[clamp(2.6rem,4.4vw,4.4rem)] leading-none text-signal tnum">{ind.proof.v}</p>
              <p className="label mt-1">{ind.proof.l}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {ind.tags.map((t) => <li key={t} className="label rounded-full border border-[var(--line)] px-4 py-2">{t}</li>)}
              </ul>
            </Reveal>
          </div>
        </section>
      ))}
    </>
  );
}
