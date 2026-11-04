'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger, registerMotion } from '@/lib/motion';
import { Reveal } from '@/components/ui/Reveal';
import { GlassCard } from '@/components/ui/GlassCard';

const LINE = 'We don’t promise speed. We promise the date, and then we keep it.';

/** Words light up as you scroll (scrubbed), then the guarantee lands as an overlapping panel. */
export function PromiseSection() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerMotion();
    const words = root.current?.querySelectorAll<HTMLElement>('[data-w]');
    if (!words?.length) return;
    const tween = gsap.fromTo(
      words,
      { opacity: 0.14, filter: 'blur(3px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none', // scrubbed scroll: the one place linear is correct
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section data-chapter="The promise" data-beat="4" className="beat veil-soft">
      <div className="wrap grid w-full grid-cols-12 gap-x-4">
        <p className="label col-span-12 mb-10 flex items-center gap-4">
          <span className="label-ink tnum">
            04 <span className="text-muted">/ 06</span>
          </span>
          <span className="rule max-w-[72px]" /> The promise
        </p>
        <div ref={root} className="col-span-12 lg:col-span-11">
          <p className="display text-[clamp(2.4rem,7vw,7.8rem)] leading-[0.98]" aria-label={LINE}>
            {LINE.split(' ').map((w, i) => (
              <span key={i} data-w aria-hidden className={`inline-block pr-[0.22em] ${/date|keep/.test(w) ? 'italic text-signal' : ''}`}>
                {w}
              </span>
            ))}
          </p>
        </div>
        <Reveal variant="plate" className="col-span-12 mt-20 md:col-span-6 lg:col-span-4 lg:col-start-2 lg:mt-32">
          <GlassCard className="panel-bg p-8 md:p-10">
            <p className="display text-[clamp(3.6rem,6vw,6rem)] leading-none tracking-[-0.05em] text-signal tnum">96.8%</p>
            <p className="mt-4 text-[19px] leading-snug">of shipments arrived on the date we quoted in the last twelve months.</p>
            <p className="label mt-6">All modes · 1.9 M shipments</p>
          </GlassCard>
        </Reveal>
        <Reveal delay={0.12} className="col-span-12 mt-10 md:col-span-6 lg:col-span-4 lg:col-start-8 lg:mt-56">
          <GlassCard className="p-8 md:p-10" glow="cyan">
            <p className="label label-ink mb-4">The guarantee</p>
            <p className="display text-[clamp(1.7rem,2.4vw,2.4rem)] leading-[1.05]">Late because of us? The credit lands on your account before you ask.</p>
            <p className="prose-body mt-5 text-[15px]">Automatic delay credits on Express and Standard. No claim forms, no call-back.</p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
