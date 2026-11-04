'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger, registerMotion } from '@/lib/motion';
import { STATS } from '@/content/site';
import { Reveal } from '@/components/ui/Reveal';

function Counter({ value, decimals = 0, suffix }: { value: number; decimals?: number; suffix: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    registerMotion();
    const node = el.current;
    if (!node) return;
    const o = { n: 0 };
    const st = ScrollTrigger.create({
      trigger: node,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(o, {
          n: value,
          duration: 2.2,
          ease: 'expoOut',
          onUpdate: () => (node.textContent = o.n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })),
        }),
    });
    return () => st.kill();
  }, [value, decimals]);
  return (
    <span className="tnum">
      <span ref={el}>{(0).toFixed(decimals)}</span>
      <span className="text-signal">{suffix}</span>
    </span>
  );
}

/** Four numbers, four different baselines: stagger-offset columns with 1px rules (not a stat-card grid). */
export function StatsStrip() {
  return (
    <section data-chapter="By the numbers" data-beat="1" className="beat veil-soft">
      <div className="wrap grid w-full grid-cols-12 gap-x-4">
        <div className="col-span-12 mb-14 flex items-center gap-4 md:mb-24">
          <span className="label label-ink tnum">
            01 <span className="text-muted">/ 06</span>
          </span>
          <span className="rule max-w-[72px]" />
          <span className="label">Proof, not promises</span>
        </div>
        {STATS.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.1}
            className={[
              'col-span-12 border-t border-[var(--line)] pb-12 pt-6 sm:col-span-6 lg:col-span-3',
              i === 1 ? 'lg:mt-24' : i === 2 ? 'lg:mt-12' : i === 3 ? 'lg:mt-36' : '',
            ].join(' ')}
          >
            <div className="display text-[clamp(4rem,9vw,9.5rem)] leading-[0.9] tracking-[-0.05em]">
              <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <p className="mt-5 max-w-[22ch] text-[19px] leading-snug">{s.label}</p>
            <p className="label mt-3">{s.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
