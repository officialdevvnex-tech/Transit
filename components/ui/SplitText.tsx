'use client';

import { useLayoutEffect, useRef, type ElementType } from 'react';
import { gsap, ScrollTrigger, registerMotion, prefersReducedMotion, stagger, dur } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  by?: 'word' | 'char';
  /** waits for the preloader hand-off instead of scroll */
  hero?: boolean;
  delay?: number;
  /** blur-to-sharp in addition to the mask */
  blur?: boolean;
  id?: string;
};

/**
 * Masked reveal. `*word*` marks emphasis (serif italic, signal orange).
 */
export function SplitText({ text, as: Tag = 'div', className, by = 'word', hero, delay = 0, blur, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const ready = useStore((s) => s.ready);
  const played = useRef(false);

  // render tokens
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  const nodes: React.ReactNode[] = [];
  let key = 0;
  parts.forEach((p) => {
    const em = p.startsWith('*') && p.endsWith('*');
    const raw = em ? p.slice(1, -1) : p;
    const words = raw.split(/(\s+)/);
    words.forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) {
        nodes.push(' ');
        return;
      }
      const units = by === 'char' ? Array.from(w) : [w];
      const inner = units.map((u) => (
        <span className="mask" key={key++} aria-hidden>
          <span className="mask-in">{u}</span>
        </span>
      ));
      nodes.push(
        em ? (
          <em key={key++} style={{ display: 'inline-block' }}>
            {inner}
          </em>
        ) : (
          <span key={key++} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {inner}
          </span>
        ),
      );
    });
  });

  // hide immediately (before paint), then play
  useLayoutEffect(() => {
    registerMotion();
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.mask-in');
    if (prefersReducedMotion()) {
      el.style.visibility = 'visible';
      return;
    }
    gsap.set(targets, { yPercent: 118, rotate: 5, transformOrigin: '0% 100%', filter: blur ? 'blur(8px)' : 'none' });
    el.style.visibility = 'visible';
    if (hero) return; // played by the ready effect below
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => play(),
    });
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => {
    if (played.current || !ref.current) return;
    played.current = true;
    gsap.to(ref.current.querySelectorAll('.mask-in'), {
      yPercent: 0,
      rotate: 0,
      filter: 'blur(0px)',
      duration: dur.section,
      ease: 'expoOut',
      stagger: by === 'char' ? stagger.char : stagger.word,
      delay,
    });
  };

  useLayoutEffect(() => {
    if (hero && ready) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hero]);

  return (
    <Tag ref={ref} id={id} data-split className={cn(className)} aria-label={text.replace(/\*/g, '')}>
      {nodes}
    </Tag>
  );
}
