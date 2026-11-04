'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { sharedState } from '@/components/layout/TransitionProvider';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type Props = {
  crumb: string;
  title: string; // *emphasis* supported; rendered as real 3D text when WebGL is available
  intro?: string;
  children?: ReactNode;
  className?: string;
  aside?: ReactNode;
};

/**
 * The page opens on a 3D headline (see Title3D). The DOM h1 stays for SEO and assistive tech and is
 * only shown when WebGL is unavailable. Crumb on top, intro + actions below the type.
 */
export function PageHero({ crumb, title, intro, children, className, aside }: Props) {
  const intro$ = useRef<HTMLDivElement>(null);
  const ready = useStore((s) => s.ready);
  const webgl = useStore((s) => s.webgl);
  const setTitle = useStore((s) => s.setTitle);
  const setReserve = useStore((s) => s.setHeroReserve);
  const plain = title.replace(/\*/g, '');

  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);

  useEffect(() => {
    const el = intro$.current;
    if (!el) return;
    const measure = () => setReserve(el.getBoundingClientRect().height + 40);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      setReserve(0);
    };
  }, [setReserve]);

  useLayoutEffect(() => {
    if (sharedState.active && intro$.current) {
      intro$.current.style.viewTransitionName = 'shared';
      intro$.current.setAttribute('data-vt', '');
    }
  }, []);

  return (
    <section data-beat="0" className={cn('relative flex min-h-[100svh] flex-col justify-between pb-[clamp(28px,5vh,64px)] pt-[calc(var(--nav-h)+28px)]', className)}>
      <div className="wrap">
        <div className="flex items-center gap-4">
          <TransitionLink href="/" className="label u-draw">
            TransitArc
          </TransitionLink>
          <span className="rule max-w-[56px]" />
          <span className="label label-ink">{crumb}</span>
        </div>
        <h1 className={cn('display t-h1 mt-10 max-w-[14ch]', webgl && 'sr-only')}>{plain}</h1>
      </div>
      <div className="wrap">
        <div ref={intro$} className="grid grid-cols-12 items-end gap-x-4 gap-y-6">
          {intro && (
            <p
              className="prose-body col-span-12 text-[clamp(1.05rem,1.35vw,1.3rem)] transition-[opacity,transform,filter] duration-[1100ms] ease-expo md:col-span-6 lg:col-span-4"
              style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(24px)', filter: ready ? 'none' : 'blur(8px)', transitionDelay: '0.5s', textShadow: '0 1px 18px rgba(7,11,16,0.9)' }}
            >
              {intro}
            </p>
          )}
          {aside && <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8">{aside}</div>}
          {children && <div className="col-span-12">{children}</div>}
        </div>
      </div>
    </section>
  );
}
