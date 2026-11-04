'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { rt } from '@/lib/runtime';
import { SCENES } from '@/lib/scenes';
import { useStore } from '@/lib/store';
import { scrollToEl } from '@/lib/scroll';
import { cn } from '@/lib/utils';

type Chapter = { label: string; f: number; el: HTMLElement };

const fmt = (km: number) => (km >= 1 ? `${Math.round(km).toLocaleString('en-US')} KM` : `${Math.max(0, Math.round(km * 1000))} M`);

/**
 * Signature interaction #1. One gauge that is scrollbar, chapter nav and altimeter:
 * scroll = descent, and the same number drives the camera distance in the 3D scene.
 */
export function AltitudeRail() {
  const path = usePathname();
  const scene = useStore((s) => s.scene);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);
  const marker = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  useEffect(() => {
    const scan = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
      setChapters(
        els.map((el) => ({ el, label: el.dataset.chapter ?? '', f: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max)) })),
      );
    };
    const t = [setTimeout(scan, 700), setTimeout(scan, 2200)];
    window.addEventListener('resize', scan);
    return () => {
      t.forEach(clearTimeout);
      window.removeEventListener('resize', scan);
    };
  }, [path]);

  useEffect(() => {
    let p = 0;
    let lastActive = 0;
    const tick = () => {
      p += (rt.progress - p) * 0.14;
      if (marker.current) marker.current.style.top = `${p * 100}%`;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      const [a0, a1] = SCENES[sceneRef.current].altitude;
      const km = a1 <= 0 ? a0 * (1 - p) : a0 * Math.pow(a1 / a0, p);
      if (readout.current) readout.current.textContent = a0 === 0 && a1 === 0 ? 'NO SIGNAL' : fmt(km);
      let idx = 0;
      chaptersRef.current.forEach((c, i) => {
        if (c.f <= rt.progress + 0.02) idx = i;
      });
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  const chaptersRef = useRef<Chapter[]>([]);
  chaptersRef.current = chapters;

  return (
    <aside aria-label="Page progress and chapters" className="pointer-events-none fixed right-[calc(var(--gutter)*0.5)] top-1/2 z-[50] hidden h-[54vh] -translate-y-1/2 lg:block">
      <div className="pointer-events-none absolute -top-14 right-0 w-32 text-right">
        <p className="label">Altitude</p>
        <span ref={readout} className="label label-ink tnum block">
          408 KM
        </span>
      </div>
      <div className="relative ml-auto h-full w-px bg-[var(--line)]">
        <div ref={fill} className="absolute inset-0 origin-top bg-signal/60" style={{ transform: 'scaleY(0)' }} />
        <div ref={marker} className="absolute -left-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-signal shadow-[0_0_14px_2px_rgba(255,122,26,0.7)]" style={{ top: '0%' }} />
        {chapters.map((c, i) => (
          <button
            key={c.label + i}
            type="button"
            onClick={() => scrollToEl(c.el, -80)}
            aria-label={`Go to ${c.label}`}
            className="group pointer-events-auto absolute right-0 flex -translate-y-1/2 items-center gap-3"
            style={{ top: `${c.f * 100}%` }}
          >
            <span className={cn('label whitespace-nowrap transition-[opacity,transform,color] duration-500 ease-expo', i === active ? 'label-ink translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100')}>{c.label}</span>
            <span className={cn('block h-px transition-[width,background] duration-500 ease-expo', i === active ? 'w-5 bg-ink' : 'w-2 bg-steel/60 group-hover:w-4')} />
          </button>
        ))}
      </div>
    </aside>
  );
}
