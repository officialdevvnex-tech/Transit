'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { TrackBar } from './TrackBar';
import { useStore } from '@/lib/store';
import { cn, pad } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

const TITLE = 'Every shipment, *on time,* everywhere.';

/** Home: the headline is real 3D type floating in front of the planet; DOM carries status, tracking and the scroll cue. */
export function HomeHero() {
  const ready = useStore((s) => s.ready);
  const webgl = useStore((s) => s.webgl);
  const setTitle = useStore((s) => s.setTitle);
  const setReserve = useStore((s) => s.setHeroReserve);
  const bottom = useRef<HTMLDivElement>(null);
  const [lanes, setLanes] = useState(0);

  useEffect(() => {
    setTitle(TITLE);
    return () => setTitle(null);
  }, [setTitle]);

  useEffect(() => {
    const el = bottom.current;
    if (!el) return;
    const measure = () => setReserve(el.getBoundingClientRect().height + 48);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      setReserve(0);
    };
  }, [setReserve]);

  useEffect(() => {
    if (!ready) return;
    const o = { n: 0 };
    const tw = gsap.to(o, { n: 214, duration: 2.2, ease: 'expoOut', delay: 0.3, onUpdate: () => setLanes(Math.round(o.n)) });
    return () => {
      tw.kill();
    };
  }, [ready]);

  const rise = (delay: number): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? 'none' : 'translateY(28px)',
    filter: ready ? 'none' : 'blur(10px)',
    transition: 'opacity 1.1s var(--expo), transform 1.1s var(--expo), filter 1.1s var(--expo)',
    transitionDelay: `${delay}s`,
  });

  return (
    <section data-beat="0" data-chapter="Orbit" className="relative flex min-h-[100svh] flex-col justify-between pb-[clamp(28px,5vh,64px)] pt-[calc(var(--nav-h)+28px)]">
      <div className="wrap flex flex-wrap items-center justify-between gap-4" style={rise(0.2)}>
        <p className="label flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          Network live · <span className="label-ink tnum">{pad(lanes, 3)}</span> lanes moving
        </p>
        <p className="label hidden md:block">51°57′N 4°08′E · Rotterdam control tower</p>
      </div>

      <h1 className={cn('display t-hero max-w-[12ch]', webgl && 'sr-only')}>Every shipment, on time, everywhere.</h1>

      <div ref={bottom} className="wrap flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div style={rise(0.5)} className="w-full md:max-w-[640px]">
          <TrackBar />
        </div>
        <div style={rise(0.65)} className="flex items-end gap-10">
          <p className="prose-body hidden max-w-[34ch] text-[17px] lg:block" style={{ textShadow: '0 1px 18px rgba(7,11,16,0.9)' }}>
            Air, ocean and road on one live map, with a delivery date we put in writing before the cargo moves.
          </p>
          <a href="#story" className="label flex items-center gap-3 pb-1 hover:text-ink" aria-label="Scroll to the story">
            Scroll <ArrowDown size={14} className="animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
