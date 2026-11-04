'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { LogoMark } from '@/components/ui/Logo';
import { useStore } from '@/lib/store';
import { prefersReducedMotion, registerMotion } from '@/lib/motion';
import { tick } from '@/lib/audio';

const LINES = ['Aligning 214 lanes', 'Loading the planet', 'Assembling the network', 'Cleared for departure'];

/**
 * Branded sequence (≈2.6s): logo draws, counter climbs while the 3D globe assembles behind the
 * left-hand panel, then the panel lifts and the hero text reveals in the same beat. Skipped on repeat visits.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const setReady = useStore((s) => s.setReady);

  useEffect(() => {
    registerMotion();
    const html = document.documentElement;
    const finish = () => {
      html.setAttribute('data-ready', '');
      setReady(true);
    };
    let seen = false;
    try {
      seen = localStorage.getItem('ta_seen') === '1';
    } catch {}
    if (seen || prefersReducedMotion() || !root.current) {
      html.setAttribute('data-seen', '');
      finish();
      return;
    }

    const state = { n: 0 };
    let li = 0;
    const tl = gsap.timeline();
    tl.to(state, {
      n: 100,
      duration: 2.0,
      ease: 'inOutQuart',
      onUpdate: () => {
        const v = Math.round(state.n);
        if (num.current) num.current.textContent = String(v).padStart(3, '0');
        if (bar.current) bar.current.style.transform = `scaleX(${state.n / 100})`;
        const idx = Math.min(LINES.length - 1, Math.floor(state.n / 26));
        if (idx !== li && line.current) {
          li = idx;
          line.current.textContent = LINES[idx];
          tick(1 + idx * 0.2);
        }
      },
    })
      .add(() => finish(), '+=0.1')
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'inOutQuart' }, '<')
      .set(root.current, { display: 'none' });
    try {
      localStorage.setItem('ta_seen', '1');
    } catch {}
    return () => {
      tl.kill();
    };
  }, [setReady]);

  return (
    <div
      id="preloader"
      ref={root}
      role="status"
      aria-label="Loading TransitArc"
      className="fixed inset-0 z-[100] flex flex-col justify-between p-[var(--gutter)]"
      style={{ background: 'linear-gradient(100deg, var(--bg) 0%, var(--bg) 46%, rgba(7,11,16,0.55) 66%, rgba(7,11,16,0) 100%)', clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="flex items-center gap-4">
        <LogoMark draw className="h-14 w-14 text-ink" />
        <span className="label label-ink">TransitArc Logistics</span>
      </div>
      <div>
        <div className="display tnum text-[clamp(5rem,16vw,15rem)] leading-[0.8] tracking-[-0.06em]">
          <span ref={num}>000</span>
        </div>
        <div className="mt-6 flex max-w-[420px] items-center gap-4">
          <div className="h-px flex-1 bg-[var(--line)]">
            <div ref={bar} className="h-px origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
          </div>
          <span ref={line} className="label label-ink w-[190px]">
            {LINES[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
