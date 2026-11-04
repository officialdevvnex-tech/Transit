'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { rt } from '@/lib/runtime';
import { cn } from '@/lib/utils';

type Props = { items: string[]; speed?: number; className?: string; reverse?: boolean; separator?: React.ReactNode };

/** Infinite marquee whose speed (and direction) is driven by scroll velocity. */
export function Marquee({ items, speed = 60, className, reverse, separator }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const half = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => (half.current = el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let x = 0;
    const tick = (_t: number, dt: number) => {
      const boost = rt.reduced ? 0 : Math.min(Math.abs(rt.velocity) * 0.9, 22);
      const dir = (reverse ? -1 : 1) * (rt.velocity < -0.5 ? -1 : 1);
      x -= dir * (rt.reduced ? speed * 0.25 : speed + boost * 40) * (dt / 1000);
      if (half.current) {
        if (x <= -half.current) x += half.current;
        if (x > 0) x -= half.current;
      }
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
    };
  }, [speed, reverse]);

  const row = items.map((t, i) => (
    <span key={i} className="flex shrink-0 items-center gap-[0.5em] pr-[0.5em]">
      <span>{t}</span>
      {separator ?? <span aria-hidden className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-signal" />}
    </span>
  ));

  return (
    <div className={cn('overflow-hidden whitespace-nowrap', className)} aria-hidden>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
