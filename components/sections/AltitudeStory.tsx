'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap, ScrollTrigger, registerMotion, fm } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Mode } from '@/lib/geo';

const CHAPTERS: { mode: Mode; n: string; kicker: string; title: string; copy: string; metrics: [string, string][] }[] = [
  { mode: 'air', n: '01', kicker: 'Cruising altitude · 11 km', title: 'Air, when the *date* can’t move.',
    copy: 'Block space on 38 carriers and charter on call. Wheels up inside six hours of pickup, a named flight before your truck leaves the dock.',
    metrics: [['310', 'departures / day'], ['6 h', 'pickup to wheels-up'], ['38', 'carriers on contract']] },
  { mode: 'sea', n: '02', kicker: 'Sea level · 0 m', title: 'Ocean, with a *schedule* you can build a factory around.',
    copy: 'Guaranteed peak-season allocation, live vessel and port-congestion tracking, and a control tower that moves your box before it sits at anchor.',
    metrics: [['420', 'sailings / week'], ['312', 'ports served'], ['2.1 d', 'median port dwell saved']] },
  { mode: 'road', n: '03', kicker: 'Ground level · 0 m', title: 'Road, because the last *600 km* decide everything.',
    copy: 'Our own cross-border fleet, a slot booked at both docks, GPS every thirty seconds and a signed proof of delivery within minutes.',
    metrics: [['6,800', 'tractors in the fleet'], ['30 s', 'GPS ping interval'], ['99.4%', 'dock-slot adherence']] },
];

const Title = ({ t }: { t: string }) => (
  <>
    {t.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : <span key={i}>{p}</span>))}
  </>
);

/**
 * Pinned storytelling: GSAP ScrollTrigger scrub + snap. Text and the 3D lane layer change together
 * (the active mode is lit on the planet, the others dim).
 */
export function AltitudeStory() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const setMode = useStore((s) => s.setMode);

  useEffect(() => {
    registerMotion();
    const el = root.current;
    if (!el) return;
    let last = -1;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: true,
      snap: { snapTo: [0, 0.5, 1], duration: { min: 0.25, max: 0.7 }, ease: 'inOutQuart', delay: 0.05 },
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleY(${self.progress})`;
        const i = Math.round(self.progress * 2);
        if (i !== last) {
          last = i;
          setIdx(i);
          setMode(CHAPTERS[i].mode);
        }
      },
      onToggle: (self) => {
        if (!self.isActive) setMode('all');
      },
    });
    return () => {
      st.kill(true);
      setMode('all');
    };
  }, [setMode]);

  const c = CHAPTERS[idx];
  return (
    <div>
    <section ref={root} id="story" data-chapter="Three modes" data-beat="2" className="relative flex h-[100svh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 scrim-x" aria-hidden />
      <div className="wrap relative grid w-full grid-cols-12 gap-x-4">
        <div className="col-span-12 flex items-start gap-8 lg:col-span-7">
          <div className="relative mt-3 hidden h-[44vh] w-px shrink-0 bg-[var(--line)] md:block" aria-hidden>
            <div ref={bar} className="absolute inset-0 origin-top bg-signal" style={{ transform: 'scaleY(0)' }} />
            {[0, 50, 100].map((p) => (
              <span key={p} className="absolute -left-[3px] h-[7px] w-[7px] rounded-full border border-steel bg-bg" style={{ top: `${p}%` }} />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="label mb-6 flex items-center gap-4">
              <span className="label-ink tnum">
                {c.n} <span className="text-muted">/ 03</span>
              </span>
              <span className="rule max-w-[56px]" />
              {c.kicker}
            </p>
            <div className="relative min-h-[clamp(300px,52vh,520px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={c.mode}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                  transition={fm.ui}
                >
                  <h2 className="display text-[clamp(2.6rem,6.2vw,6.4rem)] leading-[0.95]">
                    <Title t={c.title} />
                  </h2>
                  <p className="prose-body mt-8 text-[clamp(1rem,1.3vw,1.2rem)]">{c.copy}</p>
                  <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-[var(--line)] pt-6">
                    {c.metrics.map(([v, l]) => (
                      <div key={l}>
                        <dt className="display tnum text-[clamp(1.8rem,3vw,3rem)] leading-none">{v}</dt>
                        <dd className="label mt-2">{l}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="col-span-12 mt-8 flex items-end justify-between gap-4 lg:col-span-5 lg:mt-0 lg:flex-col lg:items-end lg:justify-end">
          <div aria-hidden className="flex gap-2">
            {CHAPTERS.map((m, i) => (
              <span key={m.mode} className={cn('label rounded-full border px-4 py-2 transition-colors duration-500 ease-expo', i === idx ? 'border-signal bg-signal text-[#0a0a0a]' : 'border-[var(--line)]')}>
                {m.mode === 'sea' ? 'Ocean' : m.mode === 'air' ? 'Air' : 'Road'}
              </span>
            ))}
          </div>
          <p className="label hidden lg:block">Scroll to change altitude ↓</p>
        </div>
      </div>
    </section>
    </div>
  );
}
