'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger, registerMotion } from '@/lib/motion';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Marquee } from '@/components/ui/Marquee';

const MANIFESTO = 'Freight is a promise made to a stranger. Somebody you will never meet is waiting for what is in that box, and the only thing that matters to them is the day it arrives. So we built a company around the day.';

export function Manifesto() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerMotion();
    const words = root.current?.querySelectorAll<HTMLElement>('[data-w]');
    if (!words?.length) return;
    const tw = gsap.fromTo(words, { opacity: 0.13 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 } });
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);
  return (
    <section data-chapter="Manifesto" data-beat="1" className="beat veil-soft">
      <div className="wrap w-full">
        <p className="label mb-10 flex items-center gap-4"><span className="label-ink tnum">01 <span className="text-muted">/ 04</span></span><span className="rule max-w-[72px]" /> Manifesto</p>
        <div ref={root} className="max-w-[22ch] lg:max-w-[26ch]">
          <p className="display text-[clamp(2.4rem,6vw,6.4rem)] leading-[0.98]" aria-label={MANIFESTO}>
            {MANIFESTO.split(' ').map((w, i) => <span key={i} data-w aria-hidden className={`inline-block pr-[0.2em] ${/day/.test(w) ? 'italic text-signal' : ''}`}>{w}</span>)}
          </p>
        </div>
      </div>
    </section>
  );
}

const TIMELINE = [
  ['2011', 'Two desks, one truck', 'Founded in Rotterdam by a customs broker and a dispatcher who were tired of explaining delays.'],
  ['2014', 'The first guaranteed date', 'We quote from the slowest leg and put the date in the contract. Customers notice.'],
  ['2018', 'Own the border', 'First in-house customs desks in the US and China. Pre-clearance becomes the default.'],
  ['2021', 'One event schema', 'Air, ocean and road report the same milestones. Tracking stops being a puzzle.'],
  ['2024', '1,900 electric tractors', 'The cleanest shuttle lanes in Europe, built with drivers, not around them.'],
  ['2026', '140 countries', 'Delivered 96.8% of 1.9 million shipments on the day we promised.'],
];

export function Timeline() {
  return (
    <section data-chapter="History" data-beat="2" className="beat">
      <div className="wrap flex w-full justify-end">
       <div className="panel w-full p-7 md:max-w-[620px] md:p-9">
        <p className="label mb-5">02 / 04 · Fifteen years</p>
        <ol className="border-t border-[var(--line)]">
          {TIMELINE.map(([y, t, d], i) => (
            <Reveal as="li" key={y} delay={i * 0.05} className="group grid grid-cols-12 gap-x-4 border-b border-[var(--line)] py-4">
              <span className="display col-span-3 text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none text-signal tnum">{y}</span>
              <span className="col-span-9"><span className="display block text-[clamp(1.2rem,1.6vw,1.6rem)] leading-tight">{t}</span><span className="prose-body mt-1 block text-[14px]">{d}</span></span>
            </Reveal>
          ))}
        </ol>
       </div>
      </div>
    </section>
  );
}

const VALUES = [
  ['The date is the product', 'We never quote a date we would not stake our own money on.'],
  ['Say it early', 'Bad news travels faster than the cargo, from a named person.'],
  ['Own the whole leg', 'Our desk, our driver, our broker. No “that’s the carrier’s problem”.'],
];

export function Values() {
  return (
    <section data-chapter="Values" data-beat="3" className="beat veil-soft">
      <div className="wrap grid w-full grid-cols-12 gap-x-4 gap-y-12">
        <div className="col-span-12 lg:col-span-5"><SectionHeading index="03" total="04" label="What we hold to" title="Three *rules* on the wall." /></div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          {VALUES.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.1} variant="plate" className={i === 1 ? 'lg:ml-16' : i === 2 ? 'lg:ml-32' : ''}>
              <GlassCard className="mb-6 p-8" glow={i === 1 ? 'cyan' : 'signal'}>
                <p className="label tnum">0{i + 1}</p>
                <p className="display mt-2 text-[clamp(1.9rem,3vw,3rem)] leading-[1]">{t}</p>
                <p className="prose-body mt-3 text-[16px]">{d}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const PEOPLE = [
  ['Marit van den Berg', 'Chief Executive', 'Former customs broker. Still reads the weekly exception report.'],
  ['Arjun Rao', 'Chief Operating Officer', 'Ran the Singapore hub through three typhoon seasons.'],
  ['Lena Okafor', 'Chief Technology Officer', 'Built the milestone platform that every mode now reports to.'],
  ['Tomás Ferreira', 'Head of Customs', 'Licensed in four jurisdictions. Collects tariff rulings for fun.'],
];

export function People() {
  return (
    <section data-chapter="People" data-beat="4" className="beat veil-soft flex-col !items-stretch justify-center">
      <div className="wrap">
        <SectionHeading index="04" total="04" label="Leadership" title="The people *on call.*" align="right" />
        <ul className="mt-14 grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {PEOPLE.map(([n, r, b], i) => (
            <Reveal as="li" key={n} delay={i * 0.08} className="panel group p-6 md:p-8">
              <div className="display grid aspect-square place-items-center border border-[var(--line)] text-[clamp(4rem,8vw,8rem)] leading-none text-ink/20 transition-colors duration-700 group-hover:border-signal group-hover:text-signal">
                {n.split(' ').map((x) => x[0]).join('')}
              </div>
              <p className="display mt-6 text-[clamp(1.4rem,1.8vw,1.8rem)] leading-tight">{n}</p>
              <p className="label mt-1">{r}</p>
              <p className="prose-body mt-3 text-[15px]">{b}</p>
            </Reveal>
          ))}
        </ul>
      </div>
      <div className="veil mt-16 overflow-hidden border-y border-[var(--line)] py-5" aria-hidden>
        <Marquee className="display text-[clamp(2rem,5vw,4.6rem)] leading-none text-ink/25" speed={50} items={['Rotterdam', 'Singapore', 'Los Angeles', 'Dubai', 'Shanghai', 'São Paulo', 'Johannesburg', 'Sydney']} />
      </div>
    </section>
  );
}
