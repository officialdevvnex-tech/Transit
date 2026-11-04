'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useStore } from '@/lib/store';
import { rt } from '@/lib/runtime';

/**
 * Sections tagged data-beat="n" drive the 3D camera: the one nearest the viewport centre wins.
 * (Cheap: reads rects at most 10×/s and only writes the store when the beat changes.)
 */
export function BeatObserver() {
  const path = usePathname();
  const setBeat = useStore((s) => s.setBeat);

  useEffect(() => {
    let els: HTMLElement[] = [];
    const scan = () => (els = Array.from(document.querySelectorAll<HTMLElement>('[data-beat]')));
    const first = setTimeout(scan, 300);
    const again = setTimeout(scan, 1500);
    let acc = 0;
    let last = -1;
    const tick = (_t: number, dt: number) => {
      acc += dt;
      if (acc < 100 || !els.length || rt.lockBeat) return;
      acc = 0;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestD = Infinity;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestD) {
          bestD = d;
          best = Number(el.dataset.beat);
        }
      }
      if (best !== last && bestD < window.innerHeight) {
        last = best;
        setBeat(best);
      }
    };
    gsap.ticker.add(tick);
    return () => {
      clearTimeout(first);
      clearTimeout(again);
      gsap.ticker.remove(tick);
    };
  }, [path, setBeat]);

  return null;
}
