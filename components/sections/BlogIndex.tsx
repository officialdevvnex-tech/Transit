'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES, POSTS } from '@/content/posts';
import { Tabs } from '@/components/ui/Tabs';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Reveal } from '@/components/ui/Reveal';
import { Plate } from './Plate';
import { fm } from '@/lib/motion';

const date = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function BlogIndex() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All');
  const list = POSTS.filter((p) => cat === 'All' || p.category === cat);
  const [lead, ...rest] = list;

  return (
    <section data-chapter="Articles" data-beat="1" className="veil-soft pb-[var(--section)] pt-24">
      <div className="wrap">
        <Tabs label="Category" tabs={CATEGORIES.map((c) => ({ id: c, label: c }))} value={cat} onChange={setCat} className="mb-12" />
        <div role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div key={cat} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={fm.ui}>
              {lead ? (
                <>
                  <TransitionLink href={`/blog/${lead.slug}`} data-cursor="label" data-cursor-label="Read" data-shared-source className="group grid grid-cols-12 gap-x-4 gap-y-8 border-t border-[var(--line)] pt-8">
                    <div className="col-span-12 lg:col-span-7">
                      <div className="aspect-[16/10] overflow-hidden border border-[var(--line)]"><div className="h-full w-full transition-transform duration-[1400ms] ease-expo group-hover:scale-[1.04]"><Plate hue={0} seed={21} interactive label={`${lead.read} min`} sub="Featured read" /></div></div>
                    </div>
                    <div className="col-span-12 lg:col-span-5 lg:self-end">
                      <p className="label">{lead.category} · {date(lead.date)}</p>
                      <h2 className="display mt-4 text-[clamp(2.4rem,4.6vw,4.8rem)] leading-[0.95] transition-transform duration-700 ease-expo group-hover:translate-x-2">{lead.title}</h2>
                      <p className="prose-body mt-5">{lead.excerpt}</p>
                    </div>
                  </TransitionLink>
                  <ul className="mt-20 grid grid-cols-12 gap-x-4 gap-y-14">
                    {rest.map((p, i) => (
                      <Reveal as="li" key={p.slug} delay={(i % 3) * 0.08} className={['col-span-12 sm:col-span-6', i % 3 === 0 ? 'lg:col-span-5' : i % 3 === 1 ? 'lg:col-span-4 lg:col-start-7 lg:mt-16' : 'lg:col-span-3 lg:col-start-11 lg:mt-32'].join(' ')}>
                        <TransitionLink href={`/blog/${p.slug}`} data-cursor="label" data-cursor-label="Read" data-shared-source className="group block border-t border-[var(--line)] pt-5">
                          <p className="label flex items-center justify-between"><span>{p.category} · {p.read} min</span><ArrowUpRight size={14} className="transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:translate-x-1" /></p>
                          <h3 className="display mt-4 text-[clamp(1.7rem,2.4vw,2.5rem)] leading-[1] transition-colors group-hover:text-signal">{p.title}</h3>
                          <p className="prose-body mt-3 text-[15px]">{p.excerpt}</p>
                          <p className="label mt-4">{date(p.date)}</p>
                        </TransitionLink>
                      </Reveal>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="prose-body border-t border-[var(--line)] pt-8">Nothing in this lane yet. We publish once a month, and only when we have numbers.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
