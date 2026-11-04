'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type Mode = 'default' | 'link' | 'label' | 'drag' | 'hide' | 'text';

/** Desktop-only cursor: dot + lerped ring. Reads data-cursor="label|drag|hide" and data-cursor-label. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('default');
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');
    return () => document.documentElement.classList.remove('has-cursor');
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const pos = { x: -100, y: -100, rx: -100, ry: -100 };
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest) return;
      const c = t.closest<HTMLElement>('[data-cursor],[data-cursor-hide],a,button,[role="button"],[role="tab"],input,textarea,select,label');
      if (!c) return setMode('default');
      if (c.hasAttribute('data-cursor-hide')) return setMode('hide');
      const kind = c.getAttribute('data-cursor');
      if (kind === 'drag') {
        setLabel('Drag');
        return setMode('drag');
      }
      if (kind === 'label') {
        setLabel(c.getAttribute('data-cursor-label') || 'View');
        return setMode('label');
      }
      if (c.matches('input,textarea')) return setMode('text');
      setMode('link');
    };
    const leave = () => setMode('hide');
    const tick = () => {
      pos.rx += (pos.x - pos.rx) * 0.16;
      pos.ry += (pos.y - pos.ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${pos.rx}px,${pos.ry}px,0)`;
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = { default: 36, link: 64, label: 96, drag: 96, hide: 0, text: 4 }[mode];
  const filled = mode === 'label' || mode === 'drag';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150]">
      <div ref={dot} className="absolute left-0 top-0 will-change-transform mix-blend-difference">
        <div
          className="-ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-white transition-[opacity,transform] duration-300 ease-expo"
          style={{ opacity: mode === 'hide' || filled ? 0 : 1, transform: mode === 'text' ? 'scale(0.4)' : 'scale(1)' }}
        />
      </div>
      <div ref={ring} className="absolute left-0 top-0 will-change-transform">
        <div
          className="grid place-items-center rounded-full border transition-[width,height,margin,background,border-color,opacity] duration-500 ease-expo"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            opacity: mode === 'hide' ? 0 : 1,
            background: filled ? 'var(--signal)' : mode === 'link' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderColor: filled ? 'var(--signal)' : 'rgba(255,255,255,0.45)',
            backdropFilter: mode === 'link' ? 'blur(2px)' : undefined,
          }}
        >
          <span className="label !text-[#0a0a0a] transition-opacity duration-300" style={{ opacity: filled ? 1 : 0 }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
