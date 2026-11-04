'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Service } from '@/content/services';
import { SplitText } from '@/components/ui/SplitText';
import { Tabs } from '@/components/ui/Tabs';
import { Accordion } from '@/components/ui/Accordion';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Reveal } from '@/components/ui/Reveal';
import { useStore } from '@/lib/store';
import { fm } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * One station of the port. The 3D camera is parked on the matching machine (data-beat), the panel
 * sits on the opposite side so the world stays visible. Entering a station lights its mode on the planet-lanes layer.
 */
export function ServiceSection({ s, i }: { s: Service; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const setMode = useStore((st) => st.setMode);
  const [level, setLevel] = useState(s.levels?.[0].name ?? '');
  const right = i % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMode(s.mode), { rootMargin: '-45% 0px -45% 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      setMode('all');
    };
  }, [s.mode, setMode]);

  const lv = s.levels?.find((l) => l.name === level);

  return (
    <section ref={ref} id={s.slug} data-beat={i + 1} data-chapter={`${s.title} ${s.emph}`} className="beat">
      <div className={cn('wrap flex w-full', right ? 'justify-end' : 'justify-start')}>
        <Reveal variant="plate" className="panel w-full p-7 md:max-w-[520px] md:p-9">
          <p className="label mb-6 flex items-center gap-4">
            <span className="label-ink tnum">{s.n} <span className="text-muted">/ 05</span></span>
            <span className="rule max-w-[40px]" /> {s.kicker}
          </p>
          <SplitText as="h2" text={`${s.title} *${s.emph}*`} className="display text-[clamp(2.6rem,4.6vw,4.6rem)] leading-[0.92]" />
          <p className="display mt-5 text-[clamp(1.3rem,1.8vw,1.7rem)] leading-[1.1]">{s.summary}</p>
          <p className="prose-body mt-4 text-[15.5px]">{s.body}</p>

          {s.levels && lv && (
            <div className="mt-6">
              <Tabs label="Air service level" tabs={s.levels.map((l) => ({ id: l.name, label: l.name }))} value={level} onChange={setLevel} />
              <motion.div key={level} role="tabpanel" initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={fm.ui} className="mt-2 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-4">
                <span className="display text-[clamp(2rem,3.4vw,3.2rem)] leading-none text-signal">{lv.time}</span>
                <span className="text-right text-[15px] text-muted">{lv.note}</span>
              </motion.div>
            </div>
          )}

          {s.slug === 'warehousing' ? (
            <div className="mt-6">
              <Accordion initial="s0" items={s.steps.map((st, k) => ({ id: `s${k}`, head: <span className="text-[16px]"><span className="label mr-3 tnum">0{k + 1}</span>{st}</span>, body: <p className="prose-body pl-8 text-[14.5px]">Logged as an event in the same feed as your freight, so stock and shipments live on one map.</p> }))} />
            </div>
          ) : (
            <ol className="mt-6 space-y-2 border-t border-[var(--line)] pt-5">
              {s.steps.slice(0, 4).map((st, k) => (
                <li key={st} className="flex gap-4 text-[15px]"><span className="label tnum pt-1">0{k + 1}</span>{st}</li>
              ))}
            </ol>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--line)] pt-5">
            {s.specs.map((x) => (
              <div key={x.k}>
                <dt className="label">{x.k}</dt>
                <dd className="mt-0.5 text-[16px]">{x.v}</dd>
              </div>
            ))}
          </dl>
          {s.slug === 'customs' && <div className="mt-6"><MagneticButton href="/quote" variant="ghost">Add customs to a quote</MagneticButton></div>}
        </Reveal>
      </div>
    </section>
  );
}
