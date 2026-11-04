'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

type Props = { children: ReactNode; className?: string; tilt?: number; as?: 'div' | 'article' | 'li'; glow?: 'signal' | 'cyan' };

/** Lifts, tilts toward the pointer and carries a glare that follows it. */
export function GlassCard({ children, className, tilt = 5, as: Tag = 'div', glow = 'signal' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const glare = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gsap.to(el, { rotateY: (px - 0.5) * tilt * 2, rotateX: -(py - 0.5) * tilt * 2, y: -6, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    if (glare.current) glare.current.style.background = `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.1), transparent 45%)`;
  };
  const leave = () => {
    if (ref.current) gsap.to(ref.current, { rotateX: 0, rotateY: 0, y: 0, duration: 0.9, ease: 'expoOut', overwrite: 'auto' });
    if (glare.current) glare.current.style.background = 'transparent';
  };

  return (
    <Tag
      ref={ref as never}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn('glass relative [transform-style:preserve-3d] [perspective:900px] will-change-transform', className)}
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px -40px ${glow === 'signal' ? 'rgba(255,122,26,0.35)' : 'rgba(56,189,248,0.3)'}` }}
    >
      <span ref={glare} aria-hidden className="pointer-events-none absolute inset-0 transition-[background] duration-200" />
      <div className="relative">{children}</div>
    </Tag>
  );
}
