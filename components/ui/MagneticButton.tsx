'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { TransitionLink } from './TransitionLink';
import { cn } from '@/lib/utils';
import { tick } from '@/lib/audio';

type Props = {
  children: string;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'ghost' | 'light';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  'aria-label'?: string;
  cursorLabel?: string;
  size?: 'md' | 'sm';
};

/**
 * Magnetic pull · label swap · fill-from-pointer · pressed squish.
 */
export function MagneticButton({ children, href, onClick, type = 'button', variant = 'solid', disabled, loading, icon, className, cursorLabel, size = 'md', ...aria }: Props) {
  const wrap = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(wrap.current, { x: x * 0.28, y: y * 0.4, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  };
  const enter = (e: React.PointerEvent<HTMLElement>) => {
    tick(1.25);
    if (!fill.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    gsap.set(fill.current, { left: e.clientX - r.left, top: e.clientY - r.top });
  };
  const leave = () => {
    if (wrap.current) gsap.to(wrap.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)', overwrite: 'auto' });
  };

  const palette = {
    solid: 'bg-signal text-[#0a0a0a] border-signal',
    light: 'bg-ink text-[#0a0a0a] border-ink',
    ghost: 'bg-transparent text-ink border-[var(--line)] hover:border-ink/40',
  }[variant];
  const fillColor = variant === 'ghost' ? 'bg-signal' : 'bg-[#0a0a0a]';

  const inner = (
    <span className={cn('relative flex items-center gap-3 overflow-hidden', size === 'sm' ? 'px-5 py-[12px]' : 'px-7 py-[18px]')}>
      <span
        ref={fill}
        aria-hidden
        className={cn(
          'pointer-events-none absolute h-[260%] aspect-square -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform duration-[700ms] ease-expo group-hover:scale-100 group-focus-visible:scale-100',
          fillColor,
        )}
      />
      <span className={cn('relative block h-[1.25em] overflow-hidden text-[13px] font-medium uppercase tracking-label leading-[1.25em]')}>
        <span className="block transition-transform duration-[600ms] ease-expo group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          {loading ? 'Sending…' : children}
        </span>
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 top-full block transition-transform duration-[600ms] ease-expo group-hover:-translate-y-full group-focus-visible:-translate-y-full',
            variant === 'ghost' ? 'text-[#0a0a0a]' : 'text-signal',
          )}
        >
          {loading ? 'Sending…' : children}
        </span>
      </span>
      <span className={cn('relative transition-colors duration-500', variant !== 'ghost' && 'group-hover:text-signal')}>
        {icon ?? <ArrowUpRight size={16} strokeWidth={2} />}
      </span>
    </span>
  );

  const cls = cn(
    'group relative inline-block select-none overflow-hidden rounded-full border transition-[transform,border-color] duration-300 ease-expo active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none',
    palette,
    className,
  );

  const content = (
    <span ref={wrap} className="inline-block will-change-transform" onPointerMove={move} onPointerLeave={leave}>
      {href ? (
        <TransitionLink href={href} className={cls} onPointerEnter={enter} data-cursor={cursorLabel ? 'label' : undefined} data-cursor-label={cursorLabel} {...aria}>
          {inner}
        </TransitionLink>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled || loading} className={cls} onPointerEnter={enter} {...aria}>
          {inner}
        </button>
      )}
    </span>
  );
  return content;
}
