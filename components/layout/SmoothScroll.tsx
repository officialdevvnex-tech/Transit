'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerMotion, prefersReducedMotion } from '@/lib/motion';
import { rt } from '@/lib/runtime';
import { setLenis } from '@/lib/scroll';

/** Lenis + GSAP ticker + the shared mutable runtime (scroll, velocity, pointer). */
export function SmoothScroll() {
  useEffect(() => {
    registerMotion();
    rt.reduced = prefersReducedMotion();

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: !rt.reduced, syncTouch: false, anchors: true });
    setLenis(lenis);
    lenis.on('scroll', (e: Lenis) => {
      rt.scroll = e.scroll;
      rt.progress = e.limit > 0 ? e.scroll / e.limit : 0;
      ScrollTrigger.update();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      rt.velocity += (lenis.velocity - rt.velocity) * 0.18;
      rt.ping *= 0.94;
      if (!rt.reduced && rt.skewTargets.size) {
        const k = Math.max(-6, Math.min(6, rt.velocity * 0.12));
        rt.skewTargets.forEach((el) => {
          el.style.transform = `skewY(${k.toFixed(3)}deg) scaleY(${(1 + Math.abs(k) * 0.006).toFixed(4)})`;
        });
      }
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onMove = (e: PointerEvent) => {
      rt.mouse.x = e.clientX;
      rt.mouse.y = e.clientY;
      rt.mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      rt.mouse.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('load', onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('load', onResize);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
