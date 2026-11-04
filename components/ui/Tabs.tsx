'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { bezier } from '@/lib/motion';
import { tick } from '@/lib/audio';
import { cn } from '@/lib/utils';

type Props<T extends string> = {
  tabs: readonly { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
};

/** Accessible tablist with a sliding underline. Panels are rendered by the caller (role=tabpanel). */
export function Tabs<T extends string>({ tabs, value, onChange, label, className }: Props<T>) {
  const group = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[n].id);
    refs.current[n]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cn('no-scrollbar flex gap-1 overflow-x-auto', className)}>
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${group}-${t.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => {
              tick(1.3);
              onChange(t.id);
            }}
            className={cn('label relative shrink-0 px-4 py-3 transition-colors duration-300', active ? 'label-ink' : 'hover:text-ink')}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-2 text-muted">{t.count}</span>}
            {active && (
              <motion.span layoutId={`${group}-ul`} className="absolute inset-x-3 bottom-0 h-px bg-signal" transition={{ duration: 0.6, ease: bezier.expoOut }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
