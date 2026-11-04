'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { rt } from '@/lib/runtime';

/** Skews/stretches its children with scroll velocity (registered with the shared ticker in SmoothScroll). */
export function VelocitySkew({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    rt.skewTargets.add(el);
    return () => {
      rt.skewTargets.delete(el);
      el.style.transform = '';
    };
  }, []);
  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
