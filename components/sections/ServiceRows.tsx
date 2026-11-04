'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SERVICES } from '@/content/services';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { tick } from '@/lib/audio';
import { Plate } from './Plate';

/**
 * List rows that expand on hover with a preview plate that follows the cursor.
 * Clicking a row carries it into /services as a shared element (View Transitions).
 */
export function ServiceRows() {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const setMode = useStore((s) => s.setMode);

  useEffect(() => {
    const pos = { x: 0, y: 0, rx: 0, ry: 0 };
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    const t = () => {
      pos.rx += (pos.x - pos.rx) * 0.12;
      pos.ry += (pos.y - pos.ry) * 0.12;
      const vx = pos.x - pos.rx;
      if (preview.current) preview.current.style.transform = `translate3d(${pos.rx + 36}px,${pos.ry - 150}px,0) rotate(${Math.max(-8, Math.min(8, vx * 0.05))}deg)`;
    };
    window.addEventListener('pointermove', move, { passive: true });
    gsap.ticker.add(t);
    return () => {
      window.removeEventListener('pointermove', move);
      gsap.ticker.remove(t);
    };
  }, []);

  return (
    <section data-chapter="Services" data-beat="3" className="beat veil-soft">
      <div className="wrap w-full lg:pr-[34%]">
        <SectionHeading index="03" total="06" label="What we move" title="Five services. *One* promise." intro="Pick a mode, or let us build the chain. Every service runs on the same map, the same customs desk and the same date." />
        <ul className="mt-16 border-t border-[var(--line)] md:mt-24" onPointerLeave={() => (setActive(null), setMode('all'))}>
          {SERVICES.map((s, i) => (
            <li key={s.slug} className="border-b border-[var(--line)]" data-shared-source onPointerEnter={() => (setActive(i), s.mode !== 'all' && setMode(s.mode), tick(1.1))}>
              <TransitionLink href={`/services#${s.slug}`} data-cursor="label" data-cursor-label="View" className="group relative grid grid-cols-12 items-baseline gap-x-4 py-7 md:py-9" aria-label={`${s.title} ${s.emph}: ${s.summary}`}>
                <span className="label tnum col-span-2 md:col-span-1">{s.n}</span>
                <span className={cn('display col-span-10 text-[clamp(2.2rem,5.2vw,5.4rem)] leading-[0.95] transition-[transform,color] duration-[800ms] ease-expo md:col-span-6', active === i ? 'translate-x-4 text-ink' : active !== null ? 'text-ink/35' : '')}>
                  {s.title} <em>{s.emph}</em>
                </span>
                <span className="col-span-9 col-start-3 mt-4 md:col-span-4 md:col-start-8 md:mt-0">
                  <span className="prose-body block text-[16px]">{s.summary}</span>
                  <span className="label mt-3 block">{s.kicker}</span>
                </span>
                <span className="col-span-1 hidden justify-self-end md:block">
                  <ArrowUpRight className={cn('transition-[transform,color] duration-500 ease-expo', active === i ? 'translate-x-1 -translate-y-1 text-signal' : 'text-muted')} />
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>

      {/* cursor-following preview */}
      <div ref={preview} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60] hidden will-change-transform lg:block">
        <div className="h-[250px] w-[200px] overflow-hidden border border-[var(--line)] bg-surface transition-[opacity,transform,clip-path] duration-[600ms] ease-expo" style={{ opacity: active !== null ? 1 : 0, transform: active !== null ? 'scale(1)' : 'scale(0.86)', clipPath: active !== null ? 'inset(0)' : 'inset(14% 14% 14% 14%)' }}>
          {SERVICES.map((s, i) => (
            <div key={s.slug} className="absolute inset-0 transition-[opacity,transform] duration-[700ms] ease-expo" style={{ opacity: active === i ? 1 : 0, transform: active === i ? 'scale(1)' : 'scale(1.15)' }}>
              <Plate hue={i % 3} seed={i + 1} label={s.specs[0].v} sub={s.specs[0].k} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
