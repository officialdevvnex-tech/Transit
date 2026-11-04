'use client';

import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAQ } from '@/content/site';

export function FaqSection() {
  return (
    <section data-chapter="Questions" data-beat="6" className="beat veil-soft">
      <div className="wrap grid w-full grid-cols-12 gap-x-4 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <SectionHeading label="Straight answers" title="Things people *ask* before they ship." />
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-32">
          <Accordion
            items={FAQ.map((f, i) => ({
              id: `f${i}`,
              head: <span className="display text-[clamp(1.4rem,2vw,2rem)] leading-tight">{f.q}</span>,
              body: <p className="prose-body max-w-[56ch]">{f.a}</p>,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
